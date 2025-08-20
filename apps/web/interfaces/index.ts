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
  type: 'Organization' | 'User';
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
  action: 'added' | 'removed';
  installation: Installation;
  repository_selection: 'all' | 'selected';
  repositories_added: Repository[];
  repositories_removed: Repository[];
  requester: null;
  sender: Sender;
}

export interface Repository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
}

//  ------------------------------------------------------------------------------------------

export interface RepositoryRenamedWebhookPayload {
  action: 'renamed';
  changes: Changes;
  repository: RepositoryRenamedWebhookPayloadRepository;
  organization: Organization;
  sender: Sender;
  installation: InstallationInterface;
}

interface Changes {
  repository: {
    name: {
      from: string;
    };
  };
}

interface InstallationInterface {
  id: number;
  node_id: string;
}

interface Organization {
  login: string;
  id: number;
  node_id: string;
  url: string;
  repos_url: string;
  events_url: string;
  hooks_url: string;
  issues_url: string;
  members_url: string;
  public_members_url: string;
  avatar_url: string;
  description: null;
}

interface RepositoryRenamedWebhookPayloadRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: Sender;
  html_url: string;
  description: string;
  fork: boolean;
  url: string;
  forks_url: string;
  keys_url: string;
  collaborators_url: string;
  teams_url: string;
  hooks_url: string;
  issue_events_url: string;
  events_url: string;
  assignees_url: string;
  branches_url: string;
  tags_url: string;
  blobs_url: string;
  git_tags_url: string;
  git_refs_url: string;
  trees_url: string;
  statuses_url: string;
  languages_url: string;
  stargazers_url: string;
  contributors_url: string;
  subscribers_url: string;
  subscription_url: string;
  commits_url: string;
  git_commits_url: string;
  comments_url: string;
  issue_comment_url: string;
  contents_url: string;
  compare_url: string;
  merges_url: string;
  archive_url: string;
  downloads_url: string;
  issues_url: string;
  pulls_url: string;
  milestones_url: string;
  notifications_url: string;
  labels_url: string;
  releases_url: string;
  deployments_url: string;
  created_at: Date;
  updated_at: Date;
  pushed_at: Date;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage: null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: null;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_discussions: boolean;
  forks_count: number;
  mirror_url: null;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: null;
  allow_forking: boolean;
  is_template: boolean;
  web_commit_signoff_required: boolean;
  topics: any[];
  visibility: string;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  custom_properties: any;
}

// --------------------------------------------------------------------------------

export interface MemberEventInterface {
  action: 'added' | 'removed' | 'edited';
  member: Sender;
  changes: unknown; // will be defined based on action type. either MemberAddedChanges or MemberEditedChanges and null for 'removed'
  repository: RepositoryRenamedWebhookPayloadRepository;
  organization: Organization;
  sender: Sender;
  installation: InstallationInterface;
}

export interface MemberAddedChanges {
  permission: {
    to: string;
  };
  role_name: {
    to: RoleType;
  };
}

export interface MemberEditedChanges {
  permission: {
    from: RoleType;
    to: RoleType;
  };
}

type RoleType = 'admin' | 'maintain' | 'read' | 'triage' | 'write';



// ----------------------------------------ISSUE COMMENT-------------------------------------
export interface IssueCommentEventInterface {
  action:       string;
  issue:        Issue;
  comment:      Comment;
  repository:   Repository;
  organization: Organization;
  sender:       Sender;
  installation: Installation;
}

export interface Comment {
  url:                      string;
  html_url:                 string;
  issue_url:                string;
  id:                       number;
  node_id:                  string;
  user:                     Sender;
  created_at:               Date;
  updated_at:               Date;
  author_association:       string;
  body:                     string;
  performed_via_github_app: null;
}

export interface Issue {
  url:                      string;
  id:                       number;
  node_id:                  string;
  number:                   number;
  title:                    string;
  user:                     Sender;
  labels:                   any[];
  state:                    string;
  locked:                   boolean;
  assignee:                 null;
  assignees:                any[];
  milestone:                null;
  comments:                 number;
  created_at:               Date;
  updated_at:               Date;
  closed_at:                Date;
  author_association:       string;
  type:                     null;
  active_lock_reason:       null;
  draft:                    boolean;
  pull_request:             PullRequest;
  body:                     string;
}

export interface PullRequest {
  url:       string;
  html_url:  string;
  diff_url:  string;
  patch_url: string;
  merged_at: Date;
}

// --------------------------------------------------------------------------------
export interface GeminiResponse {
  candidates:    Candidate[];
  modelVersion:  string;
  responseId:    string;
}

export interface Candidate {
  content:      Content;
}

export interface Content {
  parts: Part[];
  role:  string;
}

export interface Part {
  text: string;
}
