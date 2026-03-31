class TasksController < ApplicationController
  before_action :authenticate_user!

  # GET /tasks
  # Returns all tasks belonging to the requester's team.
  def index
    unless current_user.team_id.present?
      return render json: { error: "User is not part of a team" }, status: :unprocessable_content
    end

    tasks = Task.where(team_id: current_user.team_id)
    render json: tasks.as_json(methods: [ :creator_name, :assignee_name ])
  end

  # GET /tasks/:id
  def show
    task = Task.find(params[:id])

    unless current_user.team_id == task.team_id
      return render json: { error: "Not authorized" }, status: :forbidden
    end

    render json: task.as_json(methods: [ :creator_name, :assignee_name ])
  end

  # POST /tasks
  # Only a team_lead can create a task. team_id and created_by are auto-set.
  # Workflow states may be configured via all_states at creation.
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

    if task.user_id.present?
      assignee = User.find_by(id: task.user_id)
      if assignee.blank? || assignee.team_id != current_user.team_id
        return render json: { error: "Assignee must belong to the same team" }, status: :unprocessable_content
      end
    end

    if task.save
      if task.user_id.present?
        TaskHistory.create!(user_id: task.user_id, task_id: task.id, start_date: Date.today)
        TaskMailer.new_task(task).deliver_later
      end
      render json: task, status: :created
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

    if task.current_state == Task::COMPLETED
      return render json: { error: "Completed tasks cannot be reassigned" }, status: :unprocessable_content
    end

    assignee = determine_assignee
    if assignee.blank?
      return render json: { error: "Only team leads can assign tasks to other users" }, status: :forbidden
    end

    unless assignee.team_id == task.team_id
      return render json: { error: "Assignee must belong to the same team" }, status: :unprocessable_content
    end

    if !current_user.team_lead? && task.user_id.present? && task.user_id != assignee.id
      return render json: { error: "Task is already assigned" }, status: :unprocessable_content
    end

    previous_assignee_id = task.user_id
    task.assign_to!(assignee)
    if previous_assignee_id != assignee.id
      TaskHistory.create!(user_id: assignee.id, task_id: task.id, start_date: Date.today)
      TaskMailer.new_task(task).deliver_later
    end

    render json: task
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
  end

  # DELETE /tasks/:id/unassign
  # The assigned user gives up the task.
  def unassign
    task = Task.find(params[:id])

    unless task.user_id == current_user.id
      return render json: { error: "You are not assigned to this task" }, status: :forbidden
    end

    task.unassign!
    head :no_content
  end

  # POST /tasks/:id/progress
  # The assigned user requests the next completion transition.
  def progress
    task = Task.find(params[:id])

    unless current_user.team_id == task.team_id
      return render json: { error: "Not authorized" }, status: :forbidden
    end

    unless task.user_id == current_user.id
      return render json: { error: "Only the assigned user can progress this task" }, status: :forbidden
    end

    result = task.request_progress!(requested_by: current_user)
    if result == :pending
      render json: { message: "Transition is pending team lead approval", task: task }, status: :accepted
    else
      render json: task
    end
  rescue ArgumentError => e
    render json: { error: e.message }, status: :unprocessable_content
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
  end

  # GET /tasks/scores?user_id=:id
  # Returns each team task with the specified user's score for that task.
  def scores
    user = User.find(params[:user_id])

    unless user.team_id.present? && current_user.team_id == user.team_id
      return render json: { error: "Not authorized" }, status: :forbidden
    end

    unless current_user.team_lead? || current_user.id == user.id
      return render json: { error: "Not authorized" }, status: :forbidden
    end

    tasks = Task.where(team_id: user.team_id).with_score_for_user(user.id)
    render json: tasks.map { |task|
      {
        task_id: task.id,
        description: task.description,
        current_state: task.current_state,
        points: task.points,
        user_score: task.attributes["user_score"].to_i
      }
    }
  end

  private

  def task_create_params
    params.permit(:description, :due_date, :points, :user_id, :required_skills, :needs_validation, :all_states)
  end

  def task_update_params
    params.permit(:description, :points)
  end

  def determine_assignee
    return current_user unless params[:user_id].present?
    return nil unless current_user.team_lead?

    User.find_by(id: params[:user_id])
  end
end
