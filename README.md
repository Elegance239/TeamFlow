# CSCI3100 - Group 25

## Documentation

### Routes

#### Authentication (Via Devise)
| Method | Path | Params | Behaviour |
|--------|------|--------|-----------|
| `POST` | `/users/sign_in` | `email`, `password` | Log in an existing user. Returns user details on success, `401 Unauthorized` on failure |
| `DELETE` | `/users/sign_out` | — | Log out the current user |
| `POST` | `/users/password` | `email` | Send password reset instructions to the given email. Returns `200 OK` if email is found, `422 Unprocessable Content` otherwise |
| `PATCH` / `PUT` | `/users/password` | `reset_password_token`, `password`, `password_confirmation` | Reset the user’s password |
| `POST` | `/users` | `name`, `email`, `password`, `password_confirmation`, `role?` | Create a new non-guest user account |
| `PATCH` / `PUT` | `/users` | `email`, `password`, etc. | Update the current user’s account details |
| `DELETE` | `/users` | — | Delete the current user account |

#### Users
| Method | Path | Params | Behaviour |
|--------|------|--------|-----------|
| `POST` | `/users` | `name` | Create a guest user (no team, no role) |
| `GET` | `/users/:id` | — | Return user info including their team |
| `PATCH` | `/users/:id` | `name` | Update the user's name |

#### Teams
| Method | Path | Params | Behaviour |
|--------|------|--------|-----------|
| `POST` | `/teams` | `user_id`, `name`, `description?` | Create a team; requesting user becomes team lead |
| `GET` | `/teams/:id` | `user_id` | Return team info + leads; requester must be a member |
| `PATCH` | `/teams/:id` | `user_id`, `description` | Update team description; team lead only |

#### Team Members
| Method | Path | Params | Behaviour |
|--------|------|--------|-----------|
| `GET` | `/teams/:team_id/members` | `user_id` | List all members; team lead only |
| `POST` | `/teams/:team_id/members` | `user_id`, `existing_user_id` OR `name` | Add existing user or create new member; team lead only |
| `DELETE` | `/teams/:team_id/members/:id` | `user_id` | Remove member from team; team lead only, cannot remove self |

#### Tasks
| Method | Path | Params | Behaviour |
|--------|------|--------|-----------|
| `GET` | `/tasks` | `user_id` | List all tasks for the requester's team |
| `POST` | `/tasks` | `user_id`, `due_date`, `points`, `description?`, `task_steps_attributes[]?` | Create task; team lead only; `team_id` and `created_by` are auto-set; `due_date` must be today or later; task steps are immutable after creation and their `due_date`s must be non-decreasing by `step_num` |
| `GET` | `/tasks/:id` | `user_id` | Return task with its steps; requester must be in the same team |
| `PATCH` | `/tasks/:id` | `user_id`, `description?`, `points?` | Update description or points; creating team lead only |
| `DELETE` | `/tasks/:id` | `user_id` | Delete task; creating team lead only |
| `POST` | `/tasks/:id/assign` | `user_id` | Assign unassigned task to requester; logs a `TaskHistory` entry |
| `DELETE` | `/tasks/:id/unassign` | `user_id` | Give up an assigned task; assigned user only |

#### Task Steps
| Method | Path | Params | Behaviour |
|--------|------|--------|-----------|
| `GET` | `/tasks/:task_id/task_steps` | — | List steps for a task, ordered by `step_num` |
| `GET` | `/tasks/:task_id/task_steps/:id` | — | Return a single step by `step_num` |
