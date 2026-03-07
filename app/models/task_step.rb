class TaskStep < ApplicationRecord
  self.primary_key = [:task_id, :step_num]

  belongs_to :task

  validates :name, presence: true, length: { maximum: 100 }
  validates :step_num, presence: true,
                       numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :step_num, uniqueness: { scope: :task_id }

  validate :immutable, on: :update

  private

  def immutable
    errors.add(:base, "TaskStep cannot be modified after creation")
  end
end
