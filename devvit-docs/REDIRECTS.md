# How to redirect docs pages

Sometimes, we need to move or rename docs pages. To avoid breaking links, we can create redirects
from the old page to the new page.

In order to ensure that search engines / AI tooling is able to follow the redirects, we use actual
HTTP redirects, rather than relying on client-side JS redirects (such as what the Docusaurus redirect
plugin provides). These redirects are configured in
`devvit-dev-portal/server/src/lib/middleware/redirects/redirectConfig.ts`; check there for more details.
