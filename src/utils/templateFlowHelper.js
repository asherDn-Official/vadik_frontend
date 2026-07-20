/**
 * Helper utilities to convert Meta WhatsApp Account Templates to WhatsApp Flow nodes & graphs
 */

export const convertTemplateToScreenData = (template) => {
  if (!template) return null;

  const headerComp = template.components?.find(c => c.type === 'HEADER');
  const bodyComp = template.components?.find(c => c.type === 'BODY');
  const footerComp = template.components?.find(c => c.type === 'FOOTER');
  const buttonsComp = template.components?.find(c => c.type === 'BUTTONS');

  // Clean title & text
  const headerText = headerComp?.text || template.name?.replace(/_/g, ' ') || 'WhatsApp Screen';
  const bodyText = bodyComp?.text ? bodyComp.text.replace(/\{\{\d+\}\}/g, '[Variable]') : 'Please fill the details below';
  const footerText = footerComp?.text || 'Continue';

  // Build interactive fields from QUICK_REPLY or template buttons
  const fields = [];
  const quickReplies = (buttonsComp?.buttons || []).filter(b => b.type === 'QUICK_REPLY' || b.text);

  if (quickReplies.length > 0) {
    fields.push({
      id: Date.now(),
      type: 'radio',
      label: 'Select Response',
      name: 'response_choice',
      options: quickReplies.map((btn, idx) => ({
        label: btn.text || `Option ${idx + 1}`,
        value: (btn.text || `option_${idx + 1}`).toLowerCase().replace(/[^a-z0-9_]/g, '_')
      }))
    });
  }

  // Format screen title label nicely
  const formattedLabel = template.name
    ? template.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Meta Template Screen';

  return {
    label: formattedLabel,
    header: headerText,
    body: bodyText,
    footerLabel: footerText,
    fields: fields,
    metaTemplateName: template.name
  };
};

export const convertTemplateToFlowGraph = (template) => {
  const screenData = convertTemplateToScreenData(template);
  if (!screenData) return null;

  const mainNodeId = 'node_template_1';
  const nodes = [
    {
      id: mainNodeId,
      type: 'screen',
      position: { x: 100, y: 150 },
      data: screenData
    }
  ];

  const edges = [];

  // If there are options in radio field, create target screens/edges for each option for valid structure
  if (screenData.fields?.[0]?.options?.length > 0) {
    const radioField = screenData.fields[0];
    radioField.options.forEach((opt, idx) => {
      const nextNodeId = `node_template_target_${idx + 1}`;
      nodes.push({
        id: nextNodeId,
        type: 'screen',
        position: { x: 550, y: 80 + idx * 180 },
        data: {
          label: `${opt.label} Screen`,
          header: `Thank you for selecting ${opt.label}`,
          body: `Your choice (${opt.label}) has been recorded. Let us know if you need anything else.`,
          footerLabel: 'Submit',
          fields: []
        }
      });

      edges.push({
        id: `e_${mainNodeId}_${nextNodeId}`,
        source: mainNodeId,
        target: nextNodeId,
        sourceHandle: `choice_${radioField.id}_${idx}`,
        type: 'labeled',
        animated: true,
        data: { label: opt.label },
        style: { stroke: '#CB376D', strokeWidth: 2 }
      });
    });
  } else {
    // Add a completion screen so flow structure is complete
    const completionNodeId = 'node_template_completion';
    nodes.push({
      id: completionNodeId,
      type: 'screen',
      position: { x: 550, y: 150 },
      data: {
        label: 'Thank You',
        header: 'Thank You',
        body: 'Thank you for interacting with us!',
        footerLabel: 'Finish',
        fields: []
      }
    });

    edges.push({
      id: `e_${mainNodeId}_${completionNodeId}`,
      source: mainNodeId,
      target: completionNodeId,
      sourceHandle: 'submit',
      type: 'labeled',
      animated: true,
      data: { label: 'Submit' },
      style: { stroke: '#CB376D', strokeWidth: 2 }
    });
  }

  return {
    name: screenData.label,
    description: `Flow generated from Meta WhatsApp template "${template.name}"`,
    nodes,
    edges
  };
};
