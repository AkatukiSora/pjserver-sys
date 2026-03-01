# Infra CI/CD Contract

`deploy.yml` はイメージ公開後に、`AkatukiSora/k8s-deploys` へ `repository_dispatch` を送信できます。

## Event Type

- `pjserver-sys-image-published`

## Payload Schema

```json
{
  "application": "pjserver-sys",
  "containerImage": {
    "name": "akatukisora/pjserver-sys",
    "digest": "sha256:...",
    "tags": [
      "akatukisora/pjserver-sys:master",
      "akatukisora/pjserver-sys:sha-abc1234"
    ]
  },
  "source": {
    "repository": "AkatukiSora/pjserver-sys",
    "ref": "refs/heads/master",
    "sha": "...",
    "actor": "..."
  }
}
```

## k8s-deploys Side (recommended)

`k8s-deploys` 側では、受け取った `containerImage.digest` を最優先に採用し、マニフェストを書き換えてコミットする運用を推奨します。

推奨順序:

1. digest pin (`image: name@sha256:...`)
2. tag fallback (`sha-*`)

これによりタグの再利用や race condition の影響を受けにくくなります。
