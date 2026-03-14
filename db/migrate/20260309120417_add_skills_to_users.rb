class AddSkillsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :skills, :text
  end
end
