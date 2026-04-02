class TaskTransitionPending < ApplicationRecord
  belongs_to :task
  belongs_to :requested_by, class_name: "User"
  belongs_to :approved_by, class_name: "User"

  validates :from_state, :to_state, presence: true
  validates :status, inclusion: { in: %w[pending approved rejected] }

  scope :pending, -> { where(status: "pending") }

  def approve!(actor:)
    raise StandardError, "Only the assigned approver can approve this transition" unless actor.id == approved_by_id
    raise StandardError, "Transition request has already been processed" unless status == "pending"

    transaction do
      task.apply_approved_transition!(to_state: to_state, requested_by: requested_by)
      update!(status: "approved")
    end
  end

  def reject!(actor:)
    raise StandardError, "Only the assigned approver can reject this transition" unless actor.id == approved_by_id
    raise StandardError, "Transition request has already been processed" unless status == "pending"

    update!(status: "rejected")
  end
end
