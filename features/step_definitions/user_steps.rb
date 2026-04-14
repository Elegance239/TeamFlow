# features/step_definitions/user_steps.rb

Given('I am logged in as {string}') do |name|
  team = Team.create!(name: "Test Team")
  @user = User.create!(
    name: name,
    email: "chris@example.com",
    role: "team_member",
    skills: [ "React", "CSS" ],
    password: "password123",
    password_confirmation: "password123",
    team: team
    )
  visit "/"
  expect(page).to have_selector('#email', wait: 10)
  find('#email').set('chris@example.com')
  find('#password').set('password123')

  sign_in_button = find('button[type="submit"]', text: /Sign in/i, wait: 10)
  execute_script('arguments[0].click();', sign_in_button)
  expect(page).to have_selector('button[aria-label="open drawer"]', wait: 10)
end

Given('a user account exists with email {string}') do |email|
  team = Team.find_or_create_by!(name: "Testing Team")
  user = User.find_or_initialize_by(email: email)
  user.update!(
    name: "Forgot Password User",
    password: "password123",
    password_confirmation: "password123",
    role: :team_member,
    team: team
  )
end

Given('I am on the sign in page') do
  execute_script("localStorage.clear()") rescue nil
  visit "/"
  expect(page).to have_content("Sign in")
end

Given('I open the side menu') do
  drawer_button = find('button[aria-label="open drawer"]', wait: 10)
  execute_script('arguments[0].click();', drawer_button)
end

When('I click the {string} menu item') do |item_text|
  drawer_button = find('button[aria-label="open drawer"]', wait: 10)
  execute_script('arguments[0].click();', drawer_button)

  menu_item = find('span.MuiListItemText-primary', text: item_text, wait: 10)
  execute_script('arguments[0].click();', menu_item)
end

When('I click the {string} button') do |button_text|
  sleep 0.5
  find_button(button_text, wait: 2, visible: true).click
  retries = 0
  begin
    id_candidate = button_text.downcase.gsub(' ', '-') + "-button"
    task_dialog_id = "task-dialog-confirm-button"
    task_creation_id = "task-creation-confirm-button"

    begin
      Timeout.timeout(5) do
        loop do
          present = page.evaluate_script(<<~JS)
            (function() {
              const text = "#{button_text}";
              const id = "#{id_candidate}";
              const buttons = Array.from(document.querySelectorAll('button'));
              return !!buttons.find(b =>#{' '}
                b.id === "#{task_dialog_id}" ||#{' '}
                b.id === "#{task_creation_id}" ||#{' '}
                b.id === id ||#{' '}
                b.innerText.trim().toUpperCase() === text.toUpperCase()
              );
            })()
          JS
          break if present
          sleep 0.2
        end
      end
    rescue Timeout::Error, Capybara::ElementNotFound
    end

    js_selector = <<~JS
      (function() {
        const text = "#{button_text.upcase}";
        const id = "#{id_candidate.upcase}";
        const taskDialogId = "#{task_dialog_id.upcase}";
        const taskCreationId = "#{task_creation_id.upcase}";

        const buttons = Array.from(document.querySelectorAll('button'));
        const found = buttons.find(b => {
          const bId = (b.id || "").toUpperCase();
          const bTestId = (b.getAttribute('data-testid') || "").toUpperCase();
          const bText = (b.innerText || "").trim().toUpperCase();
          const spanText = b.querySelector('span') ? b.querySelector('span').innerText.trim().toUpperCase() : "";
      #{'    '}
          return bId === taskDialogId ||#{' '}
                 bId === taskCreationId ||#{' '}
                 bId === id ||#{' '}
                 bTestId === id ||#{' '}
                 bId === text ||
                 bText === text ||
                 spanText === text;
        });

        if (found) {
          found.scrollIntoView();
          found.click();
          return true;
        }
        return false;
      })()
    JS

    success = page.execute_script(js_selector)

    unless success
      # Final attempt using standard Capybara if JS click fails
      find_button(button_text, wait: 2, visible: true).click
    end

    sleep 0.5
  rescue Selenium::WebDriver::Error::StaleElementReferenceError, Capybara::ElementNotFound => e
    retries += 1
    if retries < 4
      sleep 1
      retry
    else
      begin
        raw_logs = page.driver.browser.logs.get(:browser)
        if raw_logs
          logs = raw_logs.map(&:message).join("\n")
          puts "\n--- BROWSER CONSOLE LOGS ---\n#{logs}\n---------------------------\n"
        else
          puts "No browser logs available."
        end
      rescue => log_err
        puts "Could not fetch console logs: #{log_err}"
      end
      raise e
    end
    find('[data-testid="task-dialog"]', wait: 5)
  end
end

Then('I should see {string} within the skill tags') do |skill|
  expect(page).to have_css('.skill-tag', text: skill)
end

Then('I should see {string} as my role') do |role_text|
  expect(page).to have_selector("input[value='#{role_text}']", visible: true)
end

Given('a team exists named {string}') do |team_name|
  Team.find_or_create_by!(name: team_name)
end

Given('I am logged in as a team lead') do
  team = Team.find_or_create_by!(name: "Testing Team")
  @user = User.find_or_initialize_by(email: "lead@example.com")
  @user.update!(
    name: "Lead User",
    password: "password123",
    role: :team_lead,
    team: team
  )
  execute_script("localStorage.clear()") rescue nil
  visit "/"
  fill_in "email", with: "lead@example.com"
  fill_in "password", with: "password123"
  click_button "Sign in"

  find("#dashboard-title", wait: 10)
  visit "/"
  sleep 1
end

Given('I am logged in as a normal team member') do
  team = Team.find_or_create_by!(name: "Testing Team")
  @user = User.find_or_initialize_by(email: "member@example.com")
  @user.update!(
    name: "Member User",
    password: "password123",
    role: :team_member,
    team: team
  )
  execute_script("localStorage.clear()") rescue nil
  visit "/"
  fill_in "email", with: "member@example.com"
  fill_in "password", with: "password123"
  click_button "Sign in"

  # Wait for Dashboard to show success
  find("#dashboard-title", wait: 10)
  visit "/" # Extra refresh to ensure state synchronization
  sleep 1
end

When('I click the {string} link') do |link_text|
  begin
    find('.MuiListItemButton-root', text: link_text, wait: 5, match: :first).click
  rescue Capybara::ElementNotFound
    click_link link_text
  end
end

When('I click the {string} link on sign in') do |link_text|
  escaped_text = link_text.gsub("'", "\\\\'")
  clicked = page.evaluate_script(<<~JS)
    (function() {
      const target = '#{escaped_text}'.trim().toUpperCase();
      const elements = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const found = elements.find((el) => ((el.innerText || '').trim().toUpperCase() === target));
      if (!found) return false;
      found.scrollIntoView({ block: 'center' });
      found.click();
      return true;
    })()
  JS

  unless clicked
    find('button, a, [role="button"]', text: link_text, match: :first, wait: 5).click
  end
end

When('I fill forgot password email with {string}') do |email|
  dialog = find('[role="dialog"]', text: 'Reset password', wait: 5)
  within(dialog) do
    fill_in 'email', with: email
  end
end

When('I submit forgot password request') do
  dialog = find('[role="dialog"]', text: 'Reset password', wait: 5)
  clicked = false

  within(dialog) do
    clicked = page.evaluate_script(<<~JS)
      (function() {
        const target = 'CONTINUE';
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find((b) => ((b.innerText || '').trim().toUpperCase() === target) && !b.disabled);
        if (!btn) return false;
        btn.scrollIntoView({ block: 'center' });
        btn.click();
        return true;
      })()
    JS

    find('button', text: 'Continue', match: :first, wait: 5).click unless clicked
  end
end

When('I fill in {string} with {string}') do |field, value|
  fill_in field, with: value
end

Then('I should see the text {string}') do |text|
    expect(page).to have_content(text)
end

Then('I should not see the text {string}') do |text|
    expect(page).not_to have_content(text)
end

When('I log out') do
  find('button[aria-label="account of current user"]').click
  find('li', text: 'Log Out', match: :first).click
end

When('I log in with email {string} and password {string}') do |email, password|
  execute_script("localStorage.clear()") rescue nil
  visit "/"
  fill_in "email", with: email
  fill_in "password", with: password
  click_button "Sign in"

  find("#dashboard-title", wait: 10)
  visit "/"
  sleep 1
end

Given('I refresh the page') do
  visit current_path
  if @user
    user_json = { id: @user.id, email: @user.email, role: @user.role, name: @user.name,
                  team_id: @user.team_id, skills: @user.skills }.to_json
    execute_script("localStorage.setItem('teamflowCurrentUser', '#{user_json.gsub("'", "\\'")}')") rescue nil
    visit current_path
  end
end

Given('a user exists with email {string} and password {string}') do |email, password|
  team = Team.find_or_create_by!(name: "Testing Team")
  u = User.find_or_initialize_by(email: email)
  u.update!(
    password: password,
    name: "Test User",
    role: :team_member,
    team: team
  )
end

Then('I should see the success message {string}') do |message|
  expect(page).to have_css('.MuiSnackbar-root', text: message)
end

Then('I debug the page') do
  puts page.text
end
