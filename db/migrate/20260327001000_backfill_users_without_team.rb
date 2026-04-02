class BackfillUsersWithoutTeam < ActiveRecord::Migration[8.1]
  def up
    User.where(team_id: nil).find_each do |user|
      team = Team.create!(name: "Migrated Team #{user.id}", description: "Auto-created for legacy user")
      user.update_columns(team_id: team.id, role: user.role || User.roles[:team_lead])
    end
  end

  def down
    # Intentionally no-op: this migration repairs legacy data and should not be reversed.
  end
end
