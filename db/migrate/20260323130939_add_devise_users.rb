class AddDeviseUsers < ActiveRecord::Migration[8.1]
  def change
    rename_column :users, :password_digest, :encrypted_password

    add_column :users, :reset_password_token, :string
    add_column :users, :reset_password_sent_at, :datetime
    add_column :users, :remember_created_at, :datetime

    add_index :users, :email, unique: true
    add_index :users, :reset_password_token, unique: true
  end
end
