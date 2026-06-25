#!/bin/sh
set -eu

json_escape() {
    printf '%s' "$1" | awk '{
        gsub(/\\/, "\\\\");
        gsub(/"/, "\\\"");
        printf "%s", $0;
    }'
}

bool_value() {
    case "${1:-false}" in
        true|TRUE|True|1|yes|YES|Yes) printf 'true' ;;
        *) printf 'false' ;;
    esac
}

API_URL_VALUE="$(json_escape "${API_URL:-http://localhost:8080}")"
SHOW_PRODUCT_IMAGES_VALUE="$(bool_value "${SHOW_PRODUCT_IMAGES:-false}")"
SHOW_THEME_SWITCHER_VALUE="$(bool_value "${SHOW_THEME_SWITCHER:-false}")"

cat > /var/www/configuration.json <<EOF
{
    "apiUrl": "${API_URL_VALUE}",
    "showProductImages": ${SHOW_PRODUCT_IMAGES_VALUE},
    "showThemeSwitcher": ${SHOW_THEME_SWITCHER_VALUE}
}
EOF
