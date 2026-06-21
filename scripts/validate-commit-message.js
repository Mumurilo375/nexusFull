const fs = require('fs');

const commitMsgFile = process.argv[2];

if (!commitMsgFile) {
  console.error('Husky: arquivo da mensagem de commit nao informado.');
  process.exit(1);
}

const rawMessage = fs.readFileSync(commitMsgFile, 'utf8').trim();
const firstLine = rawMessage.split(/\r?\n/, 1)[0].trim();

const conventionalCommitPattern = /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\([^)]+\))?!?: .+/i;
const allowedSpecialCases = /^(Merge\b|Revert\b)/;

if (!firstLine) {
  console.error('Husky: mensagem de commit vazia.');
  process.exit(1);
}

if (!conventionalCommitPattern.test(firstLine) && !allowedSpecialCases.test(firstLine)) {
  console.error('Husky: mensagem de commit invalida. Use Conventional Commits.');
  console.error('Exemplo: feat(admin): valida mensagem do commit');
  process.exit(1);
}
