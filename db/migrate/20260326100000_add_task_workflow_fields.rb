class AddTaskWorkflowFields < ActiveRecord::Migration[8.1]
  def change
    add_column :tasks, :required_skills, :text, null: false, default: ""
    add_column :tasks, :needs_validation, :boolean, null: false, default: false
    add_column :tasks, :state, :string, null: false, default: "UNASSIGNED"
    add_column :tasks, :completed_by_id, :bigint

    add_foreign_key :tasks, :users, column: :completed_by_id
    add_index :tasks, :state
    add_index :tasks, :completed_by_id
  end
end
