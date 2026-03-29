class DeadlineReminderJob < ApplicationJob
  queue_as :default

  def perform
    tomorrow = Date.today + 1

    tasks_due_tomorrow = Task.where(
      due_date: tomorrow,
      current_state: Task::WORKFLOW_ORDER - [Task::COMPLETED]
    ).where.not(user_id: nil)

    tasks_due_tomorrow.each do |task|
      TaskMailer.deadline_reminder(task).deliver_later
    end
  end
end