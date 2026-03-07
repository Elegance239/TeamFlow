class TaskStepsController < ApplicationController
  # GET /tasks/:task_id/task_steps
  def index
    task = Task.find(params[:task_id])
    render json: task.task_steps.order(:step_num)
  end

  # GET /tasks/:task_id/task_steps/:id  (id = step_num)
  def show
    task = Task.find(params[:task_id])
    step = task.task_steps.find_by!(step_num: params[:id])
    render json: step
  end
end
