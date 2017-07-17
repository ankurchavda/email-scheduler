# email-scheduler
A email scheduler that pulls list of emails from the database and sends campaigns using mailjet api on a specified recurrence rule.

A worker process needs to be set with a json object with the specified paramater. The json object will be fed to the forked scheduler instance. The scheduler child process will perform the task and will kill itself upon completion.
