# Preview all emails at http://localhost:3000/rails/mailers/task_mailer_mailer
class TaskMailerPreview < ActionMailer::Preview

  # Preview this email at http://localhost:3000/rails/mailers/task_mailer_mailer/new_task
  def new_task
    TaskMailer.new_task
  end

  # Preview this email at http://localhost:3000/rails/mailers/task_mailer_mailer/deadline_reminder
  def deadline_reminder
    TaskMailer.deadline_reminder
  end

end
