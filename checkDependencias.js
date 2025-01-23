const fs = require("fs");
const path = require("path");

// Leer package.json
const packageJson = require("./package.json");
const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

// Registro de dependencias
const dependencyUsage = Object.keys(dependencies).reduce((acc, dep) => {
  acc[dep] = {
    isUsed: false,
    files: new Set(),
    usageDetails: new Set(),
  };
  return acc;
}, {});

// Patrones de búsqueda específicos por dependencia
const dependencyPatterns = {
  express: [
    /require\(['"]express['"]\)/,
    /from ['"]express['"]/,
    /app\.use\(/,
    /app\.get\(/,
    /app\.post\(/,
  ],
  ejs: [
    /\.render\(/,
    /<%-.*%>/,
    /<%=.*%>/,
    /app\.set\(['"]view engine['"], ['"]ejs['"]\)/,
  ],
  mysql: [/require\(['"]mysql['"]\)/, /connection\.query\(/, /pool\.query\(/],
  axios: [/require\(['"]axios['"]\)/, /from ['"]axios['"]/, /axios\./],
  bcryptjs: [
    /require\(['"]bcryptjs['"]\)/,
    /bcrypt\.hash\(/,
    /bcrypt\.compare\(/,
  ],
  "chart.js": [
    /require\(['"]chart\.js['"]\)/,
    /from ['"]chart\.js['"]/,
    /<script.*chart\.js.*>/,
    /new Chart\(/,
  ],
  sweetalert2: [
    /require\(['"]sweetalert2['"]\)/,
    /<script.*sweetalert2.*>/,
    /Swal\./,
  ],
  nodemailer: [
    /require\(['"]nodemailer['"]\)/,
    /createTransport\(/,
    /sendMail\(/,
  ],
  dotenv: [/require\(['"]dotenv['"]\)/, /dotenv\.config\(/, /process\.env\./],
  "express-session": [
    /require\(['"]express-session['"]\)/,
    /app\.use\(session/,
  ],
  "connect-flash": [
    /require\(['"]connect-flash['"]\)/,
    /req\.flash\(/,
    /app\.use\(flash/,
  ],
  morgan: [/require\(['"]morgan['"]\)/, /app\.use\(morgan/],
  winston: [/require\(['"]winston['"]\)/, /createLogger\(/],
};

// Función para verificar si una línea está comentada
function isCommentedLine(line) {
  const trimmedLine = line.trim();
  return (
    trimmedLine.startsWith("//") ||
    trimmedLine.startsWith("/*") ||
    trimmedLine.startsWith("*")
  );
}

// Función mejorada de búsqueda
function searchInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    const ext = path.extname(filePath);

    // Filtrar comentarios de bloque y línea
    let isInBlockComment = false;
    const contentWithoutComments = lines
      .filter((line) => {
        const trimmedLine = line.trim();

        // Detectar inicio de comentario de bloque
        if (trimmedLine.includes("/*")) {
          isInBlockComment = true;
          return false;
        }

        // Detectar fin de comentario de bloque
        if (trimmedLine.includes("*/")) {
          isInBlockComment = false;
          return false;
        }

        // Ignorar líneas dentro de comentarios de bloque
        if (isInBlockComment) return false;

        // Ignorar comentarios de línea
        if (isCommentedLine(line)) return false;

        return true;
      })
      .join("\n");

    Object.entries(dependencyPatterns).forEach(([dep, patterns]) => {
      patterns.forEach((pattern) => {
        if (pattern.test(contentWithoutComments)) {
          dependencyUsage[dep].isUsed = true;
          dependencyUsage[dep].files.add(filePath);
          dependencyUsage[dep].usageDetails.add(
            `Encontrado patrón: ${pattern.toString()}`
          );
        }
      });
    });

    // Detección especial para archivos EJS
    if (ext === ".ejs") {
      dependencyUsage["ejs"].isUsed = true;
      dependencyUsage["ejs"].files.add(filePath);
    }
  } catch (error) {
    console.error(`Error al leer archivo ${filePath}:`, error.message);
  }
}

// Función para recorrer directorios
function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory() && !file.includes("node_modules")) {
        walkDir(filePath);
      } else if (stat.isFile() && /\.(js|jsx|ejs|html)$/.test(file)) {
        searchInFile(filePath);
      }
    });
  } catch (error) {
    console.error(`Error al leer directorio ${dir}:`, error.message);
  }
}

// Ejecutar análisis
console.log("🔍 Analizando uso de dependencias...\n");
walkDir("./src");
walkDir("./"); // Para archivos en la raíz

// Generar reporte
console.log("📊 REPORTE DE DEPENDENCIAS\n");

// Dependencias utilizadas
console.log("✅ DEPENDENCIAS UTILIZADAS:");
Object.entries(dependencyUsage)
  .filter(([, usage]) => usage.isUsed)
  .forEach(([dep, usage]) => {
    console.log(`\n📦 ${dep}:`);
    console.log("   Archivos:");
    usage.files.forEach((file) => {
      console.log(`   📎 ${path.relative(".", file)}`);
    });
  });

// Dependencias no utilizadas
console.log("\n⚠️ DEPENDENCIAS NO UTILIZADAS:");
const unusedDeps = Object.entries(dependencyUsage)
  .filter(([, usage]) => !usage.isUsed)
  .map(([dep]) => dep);

if (unusedDeps.length > 0) {
  unusedDeps.forEach((dep) => console.log(`   - ${dep}`));
} else {
  console.log("   ¡Todas las dependencias están siendo utilizadas!");
}

// Estadísticas
console.log("\n📈 ESTADÍSTICAS:");
console.log(`   Total de dependencias: ${Object.keys(dependencies).length}`);
console.log(
  `   Dependencias utilizadas: ${
    Object.values(dependencyUsage).filter((d) => d.isUsed).length
  }`
);
console.log(`   Dependencias sin usar: ${unusedDeps.length}`);
