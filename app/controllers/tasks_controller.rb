class TasksController < ApplicationController
  before_action :authenticate_user!

  # GET /tasks
  # Returns all tasks belonging to the requester's team.
  def index
    unless current_user.team_id.present?
      return render json: { error: "User is not part of a team" }, status: :unprocessable_content
    end

    tasks = Task.where(team_id: current_user.team_id)
    render json: tasks.as_json(include: :task_steps)
  end

  # GET /tasks/:id
  def show
    task = Task.find(params[:id])

    unless current_user.team_id == task.team_id
      return render json: { error: "Not authorized" }, status: :forbidden
    end

    render json: task.as_json(include: :task_steps)
  end

  # POST /tasks
  # Only a team_lead can create a task. team_id and created_by are auto-set.
  # Task steps may be included via task_steps_attributes.
  def create
    unless current_user.team_lead?
      return render json: { error: "Only team leads can create tasks" }, status: :forbidden
    end

    unless current_user.team_id.present?
      return render json: { error: "Team lead must belong to a team" }, status: :unprocessable_content
    end

    task = Task.new(task_create_params)
    task.team_id    = current_user.team_id
    task.created_by = current_user.id

    if task.save
      render json: task.as_json(include: :task_steps), status: :created
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_content
    end
  end

  # PATCH /tasks/:id
  # Only the creating team_lead may update. Only description and points are editable.
  def update
    task = Task.find(params[:id])

    unless task.created_by == current_user.id
      return render json: { error: "Only the creating team lead can update this task" }, status: :forbidden
    end

    if task.update(task_update_params)
      render json: task
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_content
    end
  end

  # DELETE /tasks/:id
  # Only the creating team_lead may destroy the task.
  def destroy
    task = Task.find(params[:id])

    unless task.created_by == current_user.id
      return render json: { error: "Only the creating team lead can delete this task" }, status: :forbidden
    end

    task.destroy
    head :no_content
  end

  # POST /tasks/:id/assign
  # A team member takes an unassigned task. Logs to TaskHistory.
  def assign
    task = Task.find(params[:id])

    unless current_user.team_id == task.team_id
      return render json: { error: "Not authorized" }, status: :forbidden
    end

    if task.user_id.present?
      return render json: { error: "Task is already assigned" }, status: :unprocessable_content
    end

    task.update!(user_id: current_user.id)
    TaskHistory.create!(user_id: current_user.id, task_id: task.id, start_date: Date.today)
    render json: task
  end

  # DELETE /tasks/:id/unassign
  # The assigned user gives up the task.
  def unassign
    task = Task.find(params[:id])

    unless task.user_id == current_user.id
      return render json: { error: "You are not assigned to this task" }, status: :forbidden
    end

    task.update!(user_id: nil)
    head :no_content
  end

  private

  def task_create_params
    params.permit(:description, :due_date, :points,
                  task_steps_attributes: [ :name, :description, :step_num, :due_date ])
  end

  def task_update_params
    params.permit(:description, :points)
  end
end
