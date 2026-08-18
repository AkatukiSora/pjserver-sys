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
pnpm run build:prod
pnpm audit --prod
```

Botの起動に必要な環境変数は [`env.sample`](./env.sample) を参照してください。
