class CreateTaskTransitionPendings < ActiveRecord::Migration[8.1]
  def change
    create_table :task_transition_pendings do |t|
      t.references :task, null: false, foreign_key: true
      t.references :requested_by, null: false, foreign_key: { to_table: :users }
      t.references :approved_by, null: false, foreign_key: { to_table: :users }
      t.string :from_state, null: false
      t.string :to_state, null: false
      t.string :status, null: false, default: "pending"

      t.timestamps
    end

    add_index :task_transition_pendings, [ :task_id, :status ]
  end
end
