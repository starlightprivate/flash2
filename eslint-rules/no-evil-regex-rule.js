import safe from 'safe-regex'; // eslint-disable-line

module.exports = (context) => {
  const Literal = (node) => {
    const token = context.getTokens(node)[0];
    const nodeType = token.type;
    const nodeValue = token.value;
    if (nodeType === 'RegularExpression') {
      if (!safe(nodeValue)) {
        context.report(node, 'Possible Unsafe Regular Expression');
      }
    }
  };
  return { Literal };
};
