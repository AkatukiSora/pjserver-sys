# プロセカ民営公園専属botのソースコードです。

保守を続ける事にしました
もし必要であればBSD-3ライセンスの下で使用することができます。

## 開発

Node.js 22 と、`package.json` の `packageManager` で指定された pnpm を使用します。

```shell
corepack enable
pnpm install --frozen-lockfile
pnpm run lint
pnpm run format
pnpm run typecheck
pnpm run test
pnpm run build:prod
pnpm run smoke:artifact
pnpm audit --prod
```

Botの起動に必要な環境変数は [`env.sample`](./env.sample) を参照してください。

`pnpm run build` 後は `node dist/master.js` で起動できます。起動時は、設定を検証してから
コマンドをDiscordへ同期し、その成功後にログインします。`credential`、`clientID`、`guildID` と
`mode`（`0` / `1` / `2`）はすべて必須です。

## 設計とテスト

設定の検証は `src/config.ts`、コマンドの単一registryは `src/commands/registry.ts`、interactionの
cooldownと安全なエラー返信はそれぞれ `src/cooldown.ts` と `src/interaction-response.ts` に分離しています。
welcome payloadの組み立てと送信も `src/welcome.ts` に集約し、従来のチャンネルID・メッセージ内容は維持しています。

ユニットテストはNode 22標準の `node:test` を `tsx` で実行し、Discordやネットワークへ接続しません。

## リリースとデプロイ

production は `master` の `kubernetes/` を監視する Argo CD Application（repo:
`pjserver-sys`、path: `kubernetes`、targetRevision: `master`）で管理します。Argo CD の
automated sync では prune と selfHeal を有効にし、リリース時にこのリポジトリの Git
差分を検知して同期させます。

リリースするコミットを `master` に取り込んでから、次のように厳密な SemVer タグを作成・
push してください。プレリリースも利用できます。

```shell
git switch master
git pull --ff-only origin master
git tag v1.2.3                 # または v1.2.3-rc.1
git push origin v1.2.3
```

既存タグのDeployが失敗した場合は、タグを削除・作り直し・上書きせず、Actions の **Deploy**
workflowを `master` から手動実行し、`release_tag` に既存の完全一致タグ（例: `v1.2.3`）を指定します。
この経路はタグのSemVer、`refs/tags/<tag>` の存在、そのpeeled commitが`master`の履歴にあることを
検証し、そのタグのソースだけをbuildします。手動release時は`:master` snapshotをbuildしません。

Deploy workflow は、タグが `master` の履歴上にあることを確認してから、その**完全一致タグ**
のイメージを build/push し、provenance attestation の成功後だけ
`kubernetes/kustomization.yaml` の `images.newTag` を更新します。bot がその変更を
`master` へコミットすると、Argo CD が差分を検知して rollout します。`:master` は開発用
スナップショットとして別ジョブで公開されますが、production は追従しません。タグ検証・
image build・attestation のいずれかが失敗した場合、manifest は更新されません。
複数リリースの完了順が前後しても、workflow は manifest 上の厳密 SemVer より新しいタグに
しか自動更新しません。同一タグは何もしません。古いタグへの rollback は次の手動操作だけで
行います。

roll back は、戻したい既存の完全一致タグを `kubernetes/kustomization.yaml` の `newTag` に
変更して `master` へコミットします。Argo CD が同じ経路で同期します。イメージを再公開する
必要はありません。

workflow が manifest を更新するには、repository の Actions 設定で `GITHUB_TOKEN` に
`contents: write` を許可する必要があります。将来 `master` の branch protection を有効化
する場合は、`github-actions[bot]`（またはこの workflow が使う GitHub App）に required
status checks を満たしたうえで push できる bypass 権限を付与してください。manifest-only
bot commit は Deploy workflow の対象外なので、再ビルドや無限ループは発生しません。
