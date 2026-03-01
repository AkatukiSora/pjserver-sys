# pjserver-sys

プロセカコミュニティ向け Discord Bot のアプリケーションリポジトリです。

## 開発

- Install: `pnpm install`
- Build: `pnpm run build`
- Lint: `pnpm run lint`
- Typecheck: `pnpm tsc --noEmit`
- Test: `pnpm run test`

## 必要な環境変数

`env.sample` を `.env` にコピーして以下を設定してください。

- `credential`
- `clientID`
- `guildID`
- `mode` (`0`/`1`/`2`)
- `welcomeChannelID`

## CI/CD とインフラ連携

このリポジトリはアプリケーションのビルドとコンテナ公開を担当し、Kubernetes マニフェスト管理は別リポジトリ `AkatukiSora/k8s-deploys` に分離する前提です。

### Deploy Workflow (`.github/workflows/deploy.yml`)

`master` への push または `v*` タグ push で以下を実行します。

1. `lint + typecheck + test` を実施
2. Docker イメージをビルドして Docker Hub に push
3. SBOM/provenance attestation を発行
4. `release-metadata.json` を artifact として公開
5. （任意）`k8s-deploys` に `repository_dispatch` を送信

### k8s-deploys 連携用シークレット

GitHub Actions の Secrets に以下を設定すると、自動通知が有効になります。

- `K8S_DEPLOYS_REPO_TOKEN`: `AkatukiSora/k8s-deploys` へ `repository_dispatch` を送れるトークン

### Docker Hub 用シークレット

- `DOCKER_USERNAME`
- `DOCKER_TOKEN`

## ライセンス

BSD-3-Clause
