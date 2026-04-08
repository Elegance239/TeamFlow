class TaskMailer < ApplicationMailer
  def new_task(task)
    @task = task
    @assignee = task.assigned_user
    @creator = task.creator
    mail(
      to: @assignee.email,
      subject: "New task assigned: #{@task.description}"
    )
  end

  def deadline_reminder(task)
    @task = task
    @assignee = task.assigned_user
    mail(
      to: @assignee.email,
      subject: "Reminder: \"#{@task.description}\" is due tomorrow"
    )
  end
end
