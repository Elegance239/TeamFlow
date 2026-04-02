class TaskTransitionPendingsController < ApplicationController
  before_action :authenticate_user!

  # GET /task_transition_pendings
  def index
    pendings = TaskTransitionPending.where(approved_by_id: current_user.id, status: "pending")
    render json: pendings
  end

  # POST /task_transition_pendings/:id/approve
  def approve
    pending = TaskTransitionPending.find(params[:id])
    pending.approve!(actor: current_user)
    render json: pending
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
  rescue StandardError => e
    render json: { error: e.message }, status: :forbidden
  end

  # POST /task_transition_pendings/:id/reject
  def reject
    pending = TaskTransitionPending.find(params[:id])
    pending.reject!(actor: current_user)
    render json: pending
  rescue StandardError => e
    render json: { error: e.message }, status: :forbidden
  end
end
