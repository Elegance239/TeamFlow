Before('@javascript') do
  page.execute_script('window.localStorage.clear()') rescue nil
end
