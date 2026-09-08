// Adapted from rancher-ai-ui for this chat-only extension; see README.md and LICENSE.
import { Store } from 'vuex';
import { useI18n } from '@shell/composables/useI18n';
import { Context, Message, Role, HookContextTag } from '../../types';

export interface MessageTemplateFill {
  message: Message;
  payload: string;
}

/**
 * Factory for creating template messages based on context.
 *
 * It's used in Hooks overlays to generate user messages for the AI based on the selected resource
 */
class TemplateMessageFactory {
  fill(store: Store<any>, ctx: Context, globalCtx: Context[]): Message {
    const { t } = useI18n(store);

    let messageContent = t('aiChat.message.template.heyAnalyzeResource');
    let summaryContent = '';

    const resource = ctx.value as any;

    // Add resource as context
    const resourceCtx = [{
      tag:         resource?.kind?.toLowerCase(),
      description: resource?.kind,
      icon:        ctx.icon,
      value:       resource?.name
    }];

    // Add resource's namespace as context if available
    const resourceNamespaceCtx = resource?.namespace ? [{
      tag:         'namespace',
      description: t('aiChat.message.template.namespace'),
      icon:        'icon-namespace',
      value:       resource?.namespace
    }] : [];

    const state = resource.state || resource.stateDisplay;

    switch (ctx.tag) {
    case HookContextTag.SortableTableRow:
    case HookContextTag.DetailsState:
      summaryContent = t('aiChat.message.template.summary.analyseKindAndTroubleshoot', {
        kind: resource.kind,
        name: resource.name
      }, true);
      messageContent = t('aiChat.message.template.message.explainStateForResource', {
        state,
        kind:      resource.kind,
        name:      resource.name,
        namespace: resource.namespace || null
      }, true);

      if (state?.toLowerCase() !== 'active' && state?.toLowerCase() !== 'running' && state?.toLowerCase() !== 'ready') {
        messageContent += `\n  - ${ t('aiChat.message.template.bullet.identifyCause') }\n  - ${ t('aiChat.message.template.bullet.provideActions') }`;
      } else {
        messageContent += `\n  - ${ t('aiChat.message.template.bullet.confirmExpectedState') }`;
      }
      break;
    case HookContextTag.StatusBanner:
      const { label, color } = resource.bannerProps || {};

      const issueText = color === 'error' ? t('aiChat.message.template.theError') : t('aiChat.message.template.anyProblems');

      summaryContent = t('aiChat.message.template.summary.analyseBanner', {
        label,
        issue: issueText
      }, true);
      messageContent = t('aiChat.message.template.message.explainStateForResource', {
        state,
        kind:      resource.kind,
        name:      resource.name,
        namespace: resource.namespace || null
      }, true);

      if (state?.toLowerCase() !== 'active' && state?.toLowerCase() !== 'running' && state?.toLowerCase() !== 'ready') {
        messageContent += `\n  - ${ t('aiChat.message.template.bullet.identifyCause') }\n  - ${ t('aiChat.message.template.bullet.provideActions') }`;
      } else {
        messageContent += `\n  - ${ t('aiChat.message.template.bullet.confirmExpectedState') }`;
      }
      break;
    default:
      break;
    }

    const contextContent = [
      ...(globalCtx || []),
      ...resourceCtx,
      ...resourceNamespaceCtx
    ].filter((item, index, self) => index === self.findIndex((c) => c.tag === item.tag && c.value === item.value));

    return {
      role:      Role.User,
      messageContent,
      summaryContent,
      contextContent,
      completed: true
    };
  }
}

export default new TemplateMessageFactory();