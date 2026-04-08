# features/step_definitions/task_steps.rb

When(/^I click on the task with description "([^"]*)"$/) do |desc|
  card = find('.task-card', text: desc, wait: 10)

  begin
    retries ||= 0
    card.click
    find('.MuiDialog-root', wait: 2)
  rescue => e
    retries += 1
    if retries < 3
      page.execute_script("document.querySelectorAll('.task-card').forEach(c => { if(c.innerText.includes('#{desc}')) c.click(); })")
      begin
        find('[data-testid="task-dialog"]', wait: 2)
      rescue => log_err
        puts "Could not fetch console logs: #{log_err}"
      end
      raise e
    end
  end
end

Given(/^a task exists with description "([^"]*)" and state "([^"]*)"( assigned to me)?$/) do |desc, state, assigned|
  team = @user&.team || Team.first || Team.create!(name: "Testing Team")

  creator = User.find_by(role: :team_lead) || User.create!(
    email: "creator_lead@example.com",
    password: "password123",
    name: "Creator Lead",
    role: :team_lead,
    team: team
  )

  user_id = assigned ? @user.id : nil

  Task.create!(
    description: desc,
    current_state: state,
    team: team,
    user_id: user_id,
    creator: creator,
    points: 5,
    due_date: Date.today + 7.days,
    all_states: "UNASSIGNED,ASSIGNED,COMPLETED"
  )
end

Then('the task {string} should be in the {string} section') do |desc, section_name|
  expect(page).to have_css('.MuiBox-root', text: section_name)
  within('.MuiBox-root', text: section_name, match: :prefer_exact) do
    expect(page).to have_content(desc)
  end
end

Then('I debug the page') do
  # This prints every single piece of text currently visible to the user
  puts "\n--- VISIBLE PAGE ---"
  puts page.text
  puts "--- END PAGE ---\n"

  # This finds all buttons currently on the page and prints their state
  buttons = page.all('button', visible: true)
  puts "Found #{buttons.size} visible buttons:"
  buttons.each do |b|
    puts "- Text: '#{b.text}', ID: '#{b[:id]}', Disabled: #{b.disabled?}"
  end
end
