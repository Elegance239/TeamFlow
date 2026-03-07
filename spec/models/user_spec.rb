require 'rails_helper'

RSpec.describe User, type: :model do
  describe "validations" do
    it "is valid with a name" do
      user = User.new(name: "Alice")
      expect(user).to be_valid
    end

    it "is invalid without a name" do
      user = User.new(name: nil)
      expect(user).not_to be_valid
      expect(user.errors[:name]).to be_present
    end
  end

  describe "guest mode" do
    it "can be created without a team (guest)" do
      user = User.create!(name: "Guest User")
      expect(user.team).to be_nil
      expect(user.role).to be_nil
    end
  end

  describe "associations" do
    it "belongs to a team" do
      team = Team.create!(name: "Dev Team")
      user = User.create!(name: "Bob", team: team, role: :team_member)
      expect(user.team).to eq(team)
    end
  end

  describe "role enum" do
    it "can be team_lead" do
      user = User.create!(name: "Lead", role: :team_lead)
      expect(user.team_lead?).to be true
    end

    it "can be team_member" do
      user = User.create!(name: "Member", role: :team_member)
      expect(user.team_member?).to be true
    end
  end
end
