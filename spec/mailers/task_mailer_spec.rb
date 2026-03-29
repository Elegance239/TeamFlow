require "rails_helper"

RSpec.describe TaskMailer, type: :mailer do
  describe "new_task" do
    let(:mail) { TaskMailer.new_task }

    it "renders the headers" do
      expect(mail.subject).to eq("New task")
      expect(mail.to).to eq(["to@example.org"])
      expect(mail.from).to eq(["from@example.com"])
    end

    it "renders the body" do
      expect(mail.body.encoded).to match("Hi")
    end
  end

  describe "deadline_reminder" do
    let(:mail) { TaskMailer.deadline_reminder }

    it "renders the headers" do
      expect(mail.subject).to eq("Deadline reminder")
      expect(mail.to).to eq(["to@example.org"])
      expect(mail.from).to eq(["from@example.com"])
    end

    it "renders the body" do
      expect(mail.body.encoded).to match("Hi")
    end
  end

end
