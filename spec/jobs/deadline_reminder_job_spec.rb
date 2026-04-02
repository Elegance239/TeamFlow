require 'rails_helper'

RSpec.describe DeadlineReminderJob, type: :job do
  let(:team) { create(:team) }
  let(:assignee) { create(:user, name: "Assignee", team: team) }
  let(:creator) { create(:user, :team_lead, name: "Creator", team: team) }

  describe "#perform" do
    it "sends a deadline reminder for tasks due tomorrow that are assigned and not completed" do
      # Task due tomorrow (should be included)
      task_due_tomorrow = create(:task,
        due_date: Date.today + 1,
        team: team,
        created_by: creator.id,
        assigned_user: assignee,
        current_state: "in_progress"   # not completed
      )

      # Task due today (should be ignored)
      create(:task,
        due_date: Date.today,
        team: team,
        created_by: creator.id,
        assigned_user: assignee,
        current_state: "in_progress"
      )

      # Completed task due tomorrow (should be ignored)
      create(:task,
        due_date: Date.today + 1,
        team: team,
        created_by: creator.id,
        assigned_user: assignee,
        current_state: Task::COMPLETED
      )

      # Unassigned task due tomorrow (should be ignored)
      create(:task,
        due_date: Date.today + 1,
        team: team,
        created_by: creator.id,
        assigned_user: nil,
        current_state: "in_progress"
      )

      expect {
        DeadlineReminderJob.perform_now
      }.to have_enqueued_mail(TaskMailer, :deadline_reminder).with(task_due_tomorrow)
    end

    it "does nothing if there are no tasks due tomorrow" do
      expect {
        DeadlineReminderJob.perform_now
      }.to_not have_enqueued_mail(TaskMailer, :deadline_reminder)
    end
  end
end
