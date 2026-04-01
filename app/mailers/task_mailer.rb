class TaskMailer < ApplicationMailer
  def new_task(task)
    @task = task
    @assignee = task.assigned_user
    @creator = task.creator

    mail(
      to: @assignee.email,
      subject: "New task assigned: #{@task.description}",
      from: @creator.email
    )
  end

  def deadline_reminder(task)
    @task = task
    @assignee = task.assigned_user
    @creator = task.creator
    mail(
      to: @assignee.email,
      subject: "Reminder: #{@task.description} is due tomorrow",
      from: @creator.email,
    )
  end
end
