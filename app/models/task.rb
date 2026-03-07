class Task < ApplicationRecord
  belongs_to :team
  belongs_to :creator, class_name: "User", foreign_key: :created_by
  belongs_to :assigned_user, class_name: "User", foreign_key: :user_id, optional: true

  has_many :task_steps, dependent: :destroy
  has_many :task_histories, dependent: :destroy

  accepts_nested_attributes_for :task_steps, allow_destroy: false

  validates :due_date, presence: true
  validates :points, presence: true, numericality: { only_integer: true, greater_than: 0 }

  validate :due_date_not_in_past, on: :create
  validate :task_steps_due_dates_ordered, on: :create
  validate :no_duplicate_step_nums, on: :create

  private

  def due_date_not_in_past
    return unless due_date.present?
    errors.add(:due_date, "cannot be in the past") if due_date < Date.today
  end

  def task_steps_due_dates_ordered
    steps_with_dates = task_steps
      .reject(&:marked_for_destruction?)
      .select { |s| s.due_date.present? && s.step_num.present? }
      .sort_by(&:step_num)

    steps_with_dates.each_cons(2) do |earlier, later|
      if earlier.due_date > later.due_date
        errors.add(:task_steps, "due dates must be non-decreasing with step number (step #{earlier.step_num} has a later date than step #{later.step_num})")
        break
      end
    end
  end

  def no_duplicate_step_nums
    step_nums = task_steps
      .reject(&:marked_for_destruction?)
      .map(&:step_num)
      .compact
    return if step_nums.length == step_nums.uniq.length
    errors.add(:task_steps, "cannot contain duplicate step numbers")
  end
end
