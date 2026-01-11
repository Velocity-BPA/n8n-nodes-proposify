# n8n-nodes-proposify

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Proposify that enables proposal management, template operations, prospect tracking, e-signature automation, and engagement analytics. Built for sales teams to automate document workflows and integrate Proposify with their CRM and business applications.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **Full Proposal Management**: Create, send, track, and manage proposals with 15+ operations
- **Template Operations**: Work with proposal templates, sections, and variables
- **Prospect & Contact Management**: Organize prospects and contacts with full CRUD operations
- **E-Signature Automation**: Add signature fields, send reminders, track signing status
- **Engagement Analytics**: Track proposal views, time spent, device info, and export reports
- **Fee Management**: Create and manage pricing tables with calculations
- **Comment Collaboration**: Add, reply to, and resolve comments on proposals
- **Webhook Triggers**: React to 12 proposal lifecycle events in real-time
- **PDF Downloads**: Export proposals as PDF documents

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-proposify`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-proposify
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-proposify.git
cd n8n-nodes-proposify

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-proposify

# Restart n8n
```

## Credentials Setup

To use this node, you need to configure Proposify API credentials:

| Field | Description |
|-------|-------------|
| API Key | Your Proposify API key |

### Obtaining API Credentials

1. Log in to your Proposify account
2. Navigate to **Settings** > **Integrations**
3. Find the **API** section
4. Click **Generate API Key**
5. Copy the key (shown only once)

## Resources & Operations

### Proposal (15 operations)

| Operation | Description |
|-----------|-------------|
| Get | Retrieve a specific proposal by ID |
| Get All | List all proposals with filtering |
| Create | Create a new proposal |
| Update | Update proposal details |
| Delete | Delete a proposal |
| Duplicate | Duplicate an existing proposal |
| Send | Send proposal to recipients |
| Archive | Archive a proposal |
| Restore | Restore archived proposal |
| Get Metrics | Get proposal engagement metrics |
| Get Content | Get proposal content blocks |
| Update Content | Update proposal content |
| Download PDF | Download proposal as PDF |
| Set Won | Mark proposal as won |
| Set Lost | Mark proposal as lost |

### Template (10 operations)

| Operation | Description |
|-----------|-------------|
| Get | Get template details |
| Get All | List all templates |
| Create | Create a new template |
| Update | Update template |
| Delete | Delete a template |
| Duplicate | Duplicate a template |
| Get Content | Get template content blocks |
| Update Content | Update template content |
| Get Sections | Get template sections |
| Get Variables | Get template variables |

### Prospect (7 operations)

| Operation | Description |
|-----------|-------------|
| Get | Get prospect details |
| Get All | List all prospects |
| Create | Create a new prospect |
| Update | Update prospect information |
| Delete | Delete a prospect |
| Get Proposals | Get proposals for prospect |
| Merge | Merge duplicate prospects |

### Contact (7 operations)

| Operation | Description |
|-----------|-------------|
| Get | Get contact details |
| Get All | List all contacts |
| Create | Create a new contact |
| Update | Update contact information |
| Delete | Delete a contact |
| Add to Prospect | Add contact to prospect |
| Remove from Prospect | Remove contact from prospect |

### Section (8 operations)

| Operation | Description |
|-----------|-------------|
| Get | Get section details |
| Get All | List all library sections |
| Create | Create a new section |
| Update | Update section content |
| Delete | Delete a section |
| Duplicate | Duplicate a section |
| Add to Library | Add section to content library |
| Get Versions | Get section version history |

### Fee (7 operations)

| Operation | Description |
|-----------|-------------|
| Get | Get fee table details |
| Get All | List fee tables in proposal |
| Create | Add fee item to proposal |
| Update | Update fee details |
| Delete | Remove fee from proposal |
| Reorder | Reorder fee items |
| Calculate | Recalculate fee totals |

### Signature (8 operations)

| Operation | Description |
|-----------|-------------|
| Get | Get signature details |
| Get All | List signatures on proposal |
| Create | Add signature field |
| Update | Update signature settings |
| Delete | Remove signature field |
| Get Status | Get signing status |
| Send Reminder | Send signing reminder |
| Revoke | Revoke signature request |

### Comment (7 operations)

| Operation | Description |
|-----------|-------------|
| Get | Get comment details |
| Get All | List comments on proposal |
| Create | Add comment to proposal |
| Update | Update comment |
| Delete | Delete comment |
| Resolve | Mark comment as resolved |
| Reply | Reply to a comment |

### User (5 operations)

| Operation | Description |
|-----------|-------------|
| Get | Get user details |
| Get All | List all users |
| Get Current | Get current authenticated user |
| Get Proposals | Get proposals by user |
| Get Activity | Get user activity log |

### Analytics (7 operations)

| Operation | Description |
|-----------|-------------|
| Get Proposal Views | Get view analytics for proposal |
| Get Viewer Details | Get details of who viewed |
| Get Engagement | Get engagement metrics |
| Get Page Views | Get per-page view data |
| Get Time Spent | Get time spent on proposal |
| Get Device Info | Get viewer device information |
| Export Report | Export analytics report as PDF |

## Trigger Node

The Proposify Trigger node listens for webhook events from Proposify:

| Event | Description |
|-------|-------------|
| proposal.created | New proposal created |
| proposal.sent | Proposal sent to prospect |
| proposal.viewed | Proposal viewed by recipient |
| proposal.won | Proposal marked as won |
| proposal.lost | Proposal marked as lost |
| proposal.expired | Proposal expired |
| signature.completed | All signatures collected |
| signature.declined | Signature declined |
| comment.added | New comment on proposal |
| prospect.created | New prospect created |
| fee.accepted | Fee item accepted by prospect |
| fee.declined | Optional fee declined |

### Webhook Security

The trigger supports webhook signature verification for enhanced security. Configure the webhook secret in the node options to enable verification.

## Usage Examples

### Create and Send a Proposal

```javascript
// 1. Create proposal from template
const proposal = await proposify.create({
  name: 'Q4 Sales Proposal',
  templateId: 'tmpl_123',
  prospectId: 'prsp_456',
  value: 50000,
  currency: 'USD'
});

// 2. Add signature field
await proposify.signature.create({
  proposalId: proposal.id,
  signerId: 'cont_789',
  order: 1
});

// 3. Send proposal
await proposify.send({
  proposalId: proposal.id,
  message: 'Please review our proposal',
  subject: 'Your Customized Proposal'
});
```

### Track Proposal Engagement

```javascript
// Get engagement metrics
const engagement = await proposify.analytics.getEngagement({
  proposalId: 'prop_123'
});

// Get detailed viewer information
const viewers = await proposify.analytics.getViewerDetails({
  proposalId: 'prop_123'
});
```

### Manage Prospects

```javascript
// Create prospect with contact
const prospect = await proposify.prospect.create({
  company: 'Acme Corp',
  email: 'buyer@acme.com',
  firstName: 'John',
  lastName: 'Doe'
});

// Get all proposals for prospect
const proposals = await proposify.prospect.getProposals({
  prospectId: prospect.id
});
```

## Proposify Concepts

### Proposals
Proposals are the core documents in Proposify. They contain content sections, fee tables, and can be sent to prospects for review and e-signature.

### Templates
Templates are reusable proposal structures that define the layout, sections, and default content for new proposals.

### Prospects
Prospects represent potential customers or clients. Each prospect can have multiple contacts and associated proposals.

### Fee Tables
Fee tables contain pricing information organized into line items with quantities, unit prices, discounts, and taxes.

### Signatures
E-signature fields can be added to proposals to collect legally binding signatures from recipients.

### Content Sections
Sections are modular content blocks that can be reused across templates and proposals. They support HTML content and versioning.

## Error Handling

The node handles common Proposify API errors:

| Error Type | Description |
|------------|-------------|
| authentication_error | Invalid or missing API key |
| authorization_error | Insufficient permissions |
| not_found | Resource not found |
| validation_error | Invalid request data |
| rate_limit_error | Too many requests |
| server_error | Internal server error |

The node implements automatic retry with exponential backoff for rate limit errors.

## Security Best Practices

1. **Protect API Keys**: Store API keys securely in n8n credentials
2. **Use Webhook Secrets**: Configure webhook signature verification
3. **Limit Permissions**: Use API keys with minimum required permissions
4. **Monitor Access**: Regularly review API activity logs
5. **Rotate Keys**: Periodically rotate API keys

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Support

- **Documentation**: [Proposify API Docs](https://proposify.com/api)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-proposify/issues)
- **Email**: support@velobpa.com

## Acknowledgments

- [Proposify](https://proposify.com) for their proposal management platform
- [n8n](https://n8n.io) for the workflow automation platform
- The n8n community for inspiration and support
