#!/bin/sh
set -eu

export GARAGE_CONFIG_FILE="${GARAGE_CONFIG_FILE:-/etc/garage.toml}"

echo "Esperando a que garage responda por RPC..."
until garage status >/dev/null 2>&1; do
  sleep 2
done
echo "Garage está listo."

# Con --single-node el layout se autoconfigura al arrancar; esto
# es solo una red de seguridad por si alguna vez no fuera el caso.
if garage status | grep -q "NO ROLE ASSIGNED"; then
  echo "Sin layout asignado, configurando nodo único..."
  NODE_ID=$(garage status | awk '{print $1}' | tail -n 1)
  garage layout assign -z dc1 -c 1G "$NODE_ID"
  garage layout apply --version 1
fi

provision_bucket() {
  bucket_name="$1"
  key_name="$2"
  access_key="$3"
  secret_key="$4"

  echo "== ${bucket_name} =="

  if garage bucket info "${bucket_name}" >/dev/null 2>&1; then
    echo "  bucket ya existe."
  else
    garage bucket create "${bucket_name}"
    echo "  bucket creado."
  fi

  if garage key info "${access_key}" >/dev/null 2>&1; then
    echo "  key ya importada."
  else
    garage key import "${access_key}" "${secret_key}" -n "${key_name}" --yes
    echo "  key importada."
  fi

  garage bucket allow --read --write --owner "${bucket_name}" --key "${access_key}"
  echo "  permisos read/write/owner otorgados."
}

provision_bucket "${GARAGE_AFFILIATES_BUCKET}" "affiliates-key" \
  "${GARAGE_AFFILIATES_ACCESS_KEY}" "${GARAGE_AFFILIATES_SECRET_KEY}"

provision_bucket "${GARAGE_CMS_BUCKET}" "cms-key" \
  "${GARAGE_CMS_ACCESS_KEY}" "${GARAGE_CMS_SECRET_KEY}"

echo "Init de Garage completado."