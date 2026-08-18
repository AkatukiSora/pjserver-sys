import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflow = await readFile(
  new URL("../.github/workflows/deploy.yml", import.meta.url),
  "utf8",
);

test("Deploy workflow validates release tags with its exact SemVer expression", () => {
  const match = workflow.match(/const semver = (\/\^v.*?\/);/);
  assert.ok(match, "release SemVer expression must be present");
  const semver = Function(`return ${match[1]}`)() as RegExp;
  assert.equal(semver.test("v0.1.0"), true);
  assert.equal(semver.test("v1.2.3-rc.1"), true);
  assert.equal(semver.test("v01.2.3"), false);
  assert.equal(semver.test("v1.2.3+build"), false);
});

test("manual releases use an existing tag and do not build a master snapshot", () => {
  assert.match(workflow, /workflow_dispatch:\n    inputs:\n      release_tag:/);
  assert.match(
    workflow,
    /ref: \$\{\{ needs\.validate-release\.outputs\.tag \}\}/,
  );
  assert.match(workflow, /tag_commit="\$\(git rev-list -n 1 "\$tag"\)"/);
  assert.match(
    workflow,
    /if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/master'/,
  );
});

test("Deploy promotes through a PR and explicitly dispatches CI", () => {
  assert.match(workflow, /pull-requests: write/);
  assert.match(workflow, /actions: write/);
  assert.match(workflow, /gh pr create --base master/);
  assert.match(workflow, /gh workflow run ci\.yml/);
  assert.match(workflow, /gh run watch "\$run_id" --exit-status/);
  assert.match(workflow, /gh pr checks "\$pr_url" --watch --fail-fast/);
  assert.match(workflow, /GITHUB_RUN_ID/);
  assert.match(workflow, /timeout-minutes: 30/);
  assert.match(workflow, /Code Owner must approve and merge this PR/);
  assert.doesNotMatch(workflow, /gh pr merge/);
  assert.doesNotMatch(workflow, /git push origin HEAD:master/);
});
