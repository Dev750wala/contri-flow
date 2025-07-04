export interface AppInstallationInterface {
  action: 'created' | 'deleted' | 'suspend' | 'unsuspend';
  installation: Installation;
  repositories: Repository[];
  requester: Sender | null;
  sender: Sender;
}

export interface Installation {
  id: number;
  client_id: string;
  account: Sender;
  repository_selection: string;
  access_tokens_url: string;
  repositories_url: string;
  html_url: string;
  app_id: number;
  app_slug: string;
  target_id: number;
  target_type: string;
  permissions: Permissions;
  events: Array<
    | 'commit_comment'
    | 'create'
    | 'merge_queue_entry'
    | 'public'
    | 'pull_request'
    | 'pull_request_review'
    | 'pull_request_review_comment'
    | 'pull_request_review_thread'
    | 'push'
    | 'repository'
    | 'status'
  >;
  created_at: Date;
  updated_at: Date;
  single_file_name: null;
  has_multiple_single_files: boolean;
  single_file_paths: any[];
  suspended_by: Sender | null;
  suspended_at: Date;
}

export interface Sender {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
}

export interface Permissions {
  administration: 'write' | 'read' | 'none';
  attestations: 'write' | 'read' | 'none';
  contents: 'write' | 'read' | 'none';
  merge_queues: 'write' | 'read' | 'none';
  metadata: 'write' | 'read' | 'none';
  pull_requests: 'write' | 'read' | 'none';
  repository_hooks: 'write' | 'read' | 'none';
  statuses: 'write' | 'read' | 'none';
}

export interface Repository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
}


export interface InstallationRepositories {
  action:               'added' | 'removed';
  installation:         Installation;
  repository_selection: 'all' | 'selected';
  repositories_added:   Repository[];
  repositories_removed: Repository[];
  requester:            null;
  sender:               Sender;
}

export interface Repository {
  id:        number;
  node_id:   string;
  name:      string;
  full_name: string;
  private:   boolean;
}
