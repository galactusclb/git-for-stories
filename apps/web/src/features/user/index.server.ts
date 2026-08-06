import 'server-only';

import { userQueries } from './queries';
import { fetchMyPostsServer } from './services/user.service';

export { fetchMyPostsServer, userQueries };
