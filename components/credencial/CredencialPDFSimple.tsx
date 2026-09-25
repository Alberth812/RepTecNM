import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const COLORS = {
  primary: "#004B87",
  white: "#FFFFFF",
  gray: "#6B7280",
  darkGray: "#2B2B2B",
  lightGray: "#F4F6F9",
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 383;

const styles = StyleSheet.create({
  page: {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    backgroundColor: COLORS.white,
    fontFamily: "Helvetica",
  },
  header: {
    backgroundColor: COLORS.primary,
    height: 60,
    paddingHorizontal: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  headerSubtext: {
    color: COLORS.white,
    fontSize: 9,
  },
  body: {
    padding: 30,
    flexDirection: "row",
    gap: 30,
  },
  photoBox: {
    width: 140,
    height: 180,
    backgroundColor: COLORS.lightGray,
    border: "2 solid " + COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  photoText: {
    fontSize: 11,
    color: COLORS.gray,
    textAlign: "center",
  },
  infoSection: {
    flex: 1,
    justifyContent: "space-between",
  },
  infoRow: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 9,
    color: COLORS.gray,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.darkGray,
    fontWeight: "bold",
  },
  infoValueLarge: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 20,
    borderTop: "1 solid #E5E7EB",
  },
  folioBox: {
    flex: 1,
  },
  folioLabel: {
    fontSize: 9,
    color: COLORS.gray,
    textTransform: "uppercase",
  },
  folioValue: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "bold",
    fontFamily: "Courier",
  },
  qrBox: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.white,
    border: "1 solid #E5E7EB",
    padding: 5,
  },
  qrImage: {
    width: 70,
    height: 70,
  },
});

interface CredencialPDFSimpleProps {
  numeroAfiliado: string;
  nombreCompleto: string;
  instituto: string;
  anioAprobacion: number;
  folio: string;
  logoUrl: string;
  fotografiaUrl?: string;
}

export const CredencialPDFSimple = ({
  numeroAfiliado,
  nombreCompleto,
  instituto,
  anioAprobacion,
  folio,
  logoUrl,
  fotografiaUrl,
}: CredencialPDFSimpleProps) => {
  const qrUrl = `https://reptecnm.org.mx/verificar/${folio}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`;

  return (
    <Document>
      <Page size={[PAGE_WIDTH, PAGE_HEIGHT]} style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerText}>REP-TecNM</Text>
            <Text style={styles.headerSubtext}>Red de Egresados de Posgrado</Text>
          </View>
          <Image src={logoUrl} style={{ width: 40, height: 40 }} />
        </View>

        <View style={styles.body}>
          <View style={styles.photoBox}>
            {fotografiaUrl ? (
              <Image src={fotografiaUrl} style={{ width: 140, height: 180 }} />
            ) : (
              <Text style={styles.photoText}>Sin{"\n"}fotografía</Text>
            )}
          </View>

          <View style={styles.infoSection}>
            <View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>NÚMERO DE AFILIADO</Text>
                <Text style={styles.infoValueLarge}>{numeroAfiliado}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>NOMBRE COMPLETO</Text>
                <Text style={styles.infoValue}>{nombreCompleto}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>INSTITUTO DE PROCEDENCIA</Text>
                <Text style={styles.infoValue}>{instituto}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>AÑO DE APROBACIÓN</Text>
                <Text style={styles.infoValue}>{anioAprobacion}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.folioBox}>
            <Text style={styles.folioLabel}>FOLIO DE VERIFICACIÓN</Text>
            <Text style={styles.folioValue}>{folio}</Text>
          </View>
          <View style={styles.qrBox}>
            <Image src={qrImageSrc} style={styles.qrImage} />
          </View>
        </View>
      </Page>
    </Document>
  );
};
