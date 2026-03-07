class TasksController < ApplicationController
  # GET /tasks?user_id=X
  # Returns all tasks belonging to the requester's team.
  def index
    requester = User.find(params[:user_id])

    unless requester.team_id.present?
      return render json: { error: "User is not part of a team" }, status: :unprocessable_content
    end

    tasks = Task.where(team_id: requester.team_id)
    render json: tasks.as_json(include: :task_steps)
  end

  # GET /tasks/:id?user_id=X
  def show
    requester = User.find(params[:user_id])
    task = Task.find(params[:id])

    unless requester.team_id == task.team_id
      return render json: { error: "Not authorized" }, status: :forbidden
    end

    render json: task.as_json(include: :task_steps)
  end

  # POST /tasks
  # Only a team_lead can create a task. team_id and created_by are auto-set.
  # Task steps may be included via task_steps_attributes.
  def create
    requester = User.find(params[:user_id])

    unless requester.team_lead?
      return render json: { error: "Only team leads can create tasks" }, status: :forbidden
    end

    unless requester.team_id.present?
      return render json: { error: "Team lead must belong to a team" }, status: :unprocessable_content
    end

    task = Task.new(task_create_params)
    task.team_id    = requester.team_id
    task.created_by = requester.id

    if task.save
      render json: task.as_json(include: :task_steps), status: :created
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_content
    end
  end

  # PATCH /tasks/:id
  # Only the creating team_lead may update. Only description and points are editable.
  def update
    requester = User.find(params[:user_id])
    task      = Task.find(params[:id])

    unless task.created_by == requester.id
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
    requester = User.find(params[:user_id])
    task      = Task.find(params[:id])

    unless task.created_by == requester.id
      return render json: { error: "Only the creating team lead can delete this task" }, status: :forbidden
    end

    task.destroy
    head :no_content
  end

  # POST /tasks/:id/assign
  # A team member takes an unassigned task. Logs to TaskHistory.
  def assign
    requester = User.find(params[:user_id])
    task      = Task.find(params[:id])

    unless requester.team_id == task.team_id
      return render json: { error: "Not authorized" }, status: :forbidden
    end

    if task.user_id.present?
      return render json: { error: "Task is already assigned" }, status: :unprocessable_content
    end

    task.update!(user_id: requester.id)
    TaskHistory.create!(user_id: requester.id, task_id: task.id, start_date: Date.today)
    render json: task
  end

  # DELETE /tasks/:id/unassign
  # The assigned user gives up the task.
  def unassign
    requester = User.find(params[:user_id])
    task      = Task.find(params[:id])

    unless task.user_id == requester.id
      return render json: { error: "You are not assigned to this task" }, status: :forbidden
    end

    task.update!(user_id: nil)
    head :no_content
  end

  private

  def task_create_params
    params.permit(:description, :due_date, :points,
                  task_steps_attributes: [:name, :description, :step_num, :due_date])
  end

  def task_update_params
    params.permit(:description, :points)
  end
end
