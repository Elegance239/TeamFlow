class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.references :team, null: true, foreign_key: true
      t.integer :role

      t.timestamps
    end
  end
end
