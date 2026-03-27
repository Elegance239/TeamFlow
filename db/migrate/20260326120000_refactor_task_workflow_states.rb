class RefactorTaskWorkflowStates < ActiveRecord::Migration[8.1]
  DEFAULT_ALL_STATES = "UNASSIGNED,ASSIGNED,COMPLETED".freeze

  def up
    add_column :tasks, :all_states, :text, null: false, default: DEFAULT_ALL_STATES
    add_column :tasks, :current_state, :string, null: false, default: "UNASSIGNED"
    add_index :tasks, :current_state

    execute <<~SQL
      UPDATE tasks
      SET current_state = CASE
        WHEN state IN ('UNASSIGNED', 'ASSIGNED', 'DEVELOPMENT', 'TESTING', 'PRODUCTION', 'COMPLETED') THEN state
        WHEN state LIKE 'COMPLETED_%' THEN 'COMPLETED'
        ELSE 'UNASSIGNED'
      END
    SQL

    execute <<~SQL
      UPDATE tasks
      SET all_states = '#{DEFAULT_ALL_STATES}'
      WHERE all_states IS NULL OR all_states = ''
    SQL

    remove_index :tasks, :state if index_exists?(:tasks, :state)
    remove_column :tasks, :state, :string

    drop_table :task_steps
  end

  def down
    create_table :task_steps, primary_key: [:task_id, :step_num] do |t|
      t.date :due_date
      t.string :name, null: false
      t.text :description
      t.integer :step_num, null: false
      t.bigint :task_id, null: false
      t.datetime :created_at, null: false, default: -> { "CURRENT_TIMESTAMP" }
    end

    add_foreign_key :task_steps, :tasks
    add_index :task_steps, :task_id

    add_column :tasks, :state, :string, null: false, default: "UNASSIGNED"
    add_index :tasks, :state

    execute <<~SQL
      UPDATE tasks
      SET state = current_state
    SQL

    remove_index :tasks, :current_state if index_exists?(:tasks, :current_state)
    remove_column :tasks, :current_state, :string
    remove_column :tasks, :all_states, :text
  end
end
