require 'rails_helper'

RSpec.describe DeadlineReminderJob, type: :job do
  let(:team) { create(:team) }
  let(:lead) { create(:user, :team_lead, team: team) }
  let(:member) { create(:user, :team_member, team: team, skills: "html,css,js,ruby,rails") }

  describe "#perform" do
    it "sends reminder emails for assigned tasks due tomorrow" do
      task = create(:task,
        due_date: Date.today + 1,
        team: team,
        created_by: lead.id,
        assigned_user: member
      )

      expect {
        DeadlineReminderJob.perform_now
      }.to have_enqueued_mail(TaskMailer, :deadline_reminder).with(task)
    end

    it "does not send reminder for tasks due today" do
      create(:task,
        due_date: Date.today,
        team: team,
        created_by: lead.id,
        assigned_user: member
      )

      expect {
        DeadlineReminderJob.perform_now
      }.not_to have_enqueued_mail(TaskMailer, :deadline_reminder)
    end

    it "does not send reminder for completed tasks" do
      task = create(:task,
        due_date: Date.today + 1,
        team: team,
        created_by: lead.id,
        assigned_user: member
      )
      task.update_columns(current_state: Task::COMPLETED)

      expect {
        DeadlineReminderJob.perform_now
      }.not_to have_enqueued_mail(TaskMailer, :deadline_reminder)
    end

    it "does not send reminder for unassigned tasks" do
      create(:task,
        due_date: Date.today + 1,
        team: team,
        created_by: lead.id
      )

      expect {
        DeadlineReminderJob.perform_now
      }.not_to have_enqueued_mail(TaskMailer, :deadline_reminder)
    end

    it "does nothing if no tasks are due tomorrow" do
      expect {
        DeadlineReminderJob.perform_now
      }.not_to have_enqueued_mail(TaskMailer, :deadline_reminder)
    end
  end
end
