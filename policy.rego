package example.authz

default allow = false

allow {
  input.user == "alice"
  input.action == "view"
  input.resource == "document"
}