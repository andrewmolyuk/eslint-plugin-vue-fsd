.PHONY: install lint test update drawio

install:
	npm install --no-audit --no-fund 

lint:
	npx eslint . --ext .ts,.js,.vue --fix
	npx markdownlint --fix "**/*.md" -i node_modules
	npx prettier --write "**/*.md" "**/*.json" "**/*.js" "**/*.ts" --log-level warn

test: lint
	CI=CI npx vitest --coverage

update:
	npx npm-check-updates -u
	npm install --no-audit --no-fund

drawio:
	@if [ -z "$(DRAWIO_CMD)" ]; then \
		if [ -x "/mnt/c/Program Files/draw.io/draw.io.exe" ]; then DRAWIO_CMD="/mnt/c/Program Files/draw.io/draw.io.exe"; \
		elif [ -x "/Applications/draw.io.app/Contents/MacOS/draw.io" ]; then DRAWIO_CMD="/Applications/draw.io.app/Contents/MacOS/draw.io"; \
		elif [ -x "/Applications/diagrams.net.app/Contents/MacOS/diagrams.net" ]; then DRAWIO_CMD="/Applications/diagrams.net.app/Contents/MacOS/diagrams.net"; \
		elif command -v draw.io >/dev/null 2>&1; then DRAWIO_CMD="$$(command -v draw.io)"; \
		elif command -v diagrams.net >/dev/null 2>&1; then DRAWIO_CMD="$$(command -v diagrams.net)"; \
		else DRAWIO_CMD=""; fi; \
	fi; \
	if [ -z "$$DRAWIO_CMD" ]; then \
		echo "draw.io/diagrams.net not found. Install it or set DRAWIO_CMD environment variable."; \
		exit 1; \
	fi; \
	"$$DRAWIO_CMD" -x -o docs/assets --transparent -f png docs/assets/drawio/*.drawio
