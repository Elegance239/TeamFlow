require 'rails_helper'

RSpec.describe Team, type: :model do
  describe "validations" do
    it "is valid with a unique name" do
      team = Team.new(name: "Alpha")
      expect(team).to be_valid
    end

    it "is invalid without a name" do
      team = Team.new(name: nil)
      expect(team).not_to be_valid
      expect(team.errors[:name]).to be_present
    end

    it "is invalid with a duplicate name" do
      Team.create!(name: "Alpha")
      duplicate = Team.new(name: "Alpha")
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:name]).to be_present
    end

    it "is case-insensitively unique" do
      Team.create!(name: "Alpha")
      duplicate = Team.new(name: "alpha")
      expect(duplicate).not_to be_valid
    end
  end

  describe "associations" do
    it "has many users" do
      team = Team.create!(name: "Dev")
      User.create!(name: "Alice", team: team, role: :team_lead)
      User.create!(name: "Bob", team: team, role: :team_member)
      expect(team.users.count).to eq(2)
    end

    it "nullifies user team_id when team is destroyed" do
      team = Team.create!(name: "Temp")
      user = User.create!(name: "Alice", team: team, role: :team_member)
      team.destroy
      expect(user.reload.team_id).to be_nil
    end
  end
end
