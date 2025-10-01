/**
 * @author M. Steiger, Materna Information & Communications SE
 */
import java.io.IOException;
import java.io.InputStream;
import java.net.Authenticator;
import java.net.PasswordAuthentication;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Properties;

public class MavenWrapperDownloader {

    private static final String WRAPPER_VERSION = "0.5.6";
    /**
     * Default URL to download the maven-wrapper.jar from, if no 'downloadUrl' is provided.
     */
    private static final String DEFAULT_DOWNLOAD_URL = "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar";

    /**
     * Path to the maven-wrapper.properties file, which might contain a downloadUrl property to
     * use instead of the default one.
     */
    private static final String MAVEN_WRAPPER_PROPERTIES_PATH =
            ".mvn/wrapper/maven-wrapper.properties";

    /**
     * Path where the maven-wrapper.jar will be saved to.
     */
    private static final String MAVEN_WRAPPER_JAR_PATH =
            ".mvn/wrapper/maven-wrapper.jar";

    /**
     * Name of the property which should be used to override the default download url for the wrapper.
     */
    private static final String PROPERTY_NAME_WRAPPER_URL = "wrapperUrl";

    public static void main(String args[]) {
        System.out.println("- Downloader started");
        Path baseDir = Paths.get(args[0]);

        // If the maven-wrapper.properties exists, read it and check if it contains a custom
        // wrapperUrl parameter.
        Path mavenWrapperPropertyFile = baseDir.resolve(MAVEN_WRAPPER_PROPERTIES_PATH);
        String url = DEFAULT_DOWNLOAD_URL;
        if (Files.exists(mavenWrapperPropertyFile)) {
            try (InputStream stream = Files.newInputStream(mavenWrapperPropertyFile)) {
                Properties mavenWrapperProperties = new Properties();
                mavenWrapperProperties.load(stream);
                url = mavenWrapperProperties.getProperty(PROPERTY_NAME_WRAPPER_URL, url);
            } catch (IOException e) {
                System.out.println("- ERROR reading '" + MAVEN_WRAPPER_PROPERTIES_PATH + "'");
            }
        }
        System.out.println("- Downloading from: " + url);

        Path outputFile = baseDir.resolve(MAVEN_WRAPPER_JAR_PATH);
        if (!Files.exists(outputFile.getParent())) {
            try {
                Files.createDirectories(outputFile.getParent());
            } catch (IOException e) {
                System.out.println("- ERROR creating output directory '" + outputFile.getParent() + "'");
                e.printStackTrace();
                return;
            }
        }
        System.out.println("- Downloading to: " + outputFile);
        try {
            downloadFileFromURL(url, outputFile);
            System.out.println("Done");
            System.exit(0);
        } catch (Throwable e) {
            System.out.println("- Error downloading");
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static void downloadFileFromURL(String urlString, Path destination) throws Exception {
        if (System.getenv("MVNW_USERNAME") != null && System.getenv("MVNW_PASSWORD") != null) {
            String username = System.getenv("MVNW_USERNAME");
            char[] password = System.getenv("MVNW_PASSWORD").toCharArray();
            Authenticator.setDefault(new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(username, password);
                }
            });
        }

        URL website = new URI(urlString).toURL();
        URLConnection connection = website.openConnection();
        try (InputStream inStream = connection.getInputStream()) {
            Files.copy(inStream, destination, StandardCopyOption.REPLACE_EXISTING);
        }
    }

}
