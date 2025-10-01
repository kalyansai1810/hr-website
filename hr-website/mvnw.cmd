@ECHO OFF

SETLOCAL

SET "MAVEN_PROJECT_BASE_DIR=%~dp0"
IF "%MAVEN_PROJECT_BASE_DIR%" == "" SET MAVEN_PROJECT_BASE_DIR=.

SET "MAVEN_CMD_LINE_ARGS=%*"

SET "MVNW_VERBOSE=false"
IF "%1"=="-v" SET "MVNW_VERBOSE=true"
IF "%1"=="--verbose" SET "MVNW_VERBOSE=true"

SET "MAVEN_WRAPPER_JAR_DIR=%MAVEN_PROJECT_BASE_DIR%.mvn\wrapper"
SET "MAVEN_WRAPPER_JAR_PATH=%MAVEN_WRAPPER_JAR_DIR%\maven-wrapper.jar"
SET "MAVEN_WRAPPER_PROPERTIES_PATH=%MAVEN_WRAPPER_JAR_DIR%\maven-wrapper.properties"
SET "MAVEN_WRAPPER_DOWNLOADER_PATH=%MAVEN_PROJECT_BASE_DIR%.mvn\wrapper\MavenWrapperDownloader.java"

SET "JAVA_CMD=java.exe"
IF NOT "%JAVA_HOME%" == "" (
  SET "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
)

IF NOT EXIST "%MAVEN_WRAPPER_JAR_PATH%" (
  IF "%MVNW_VERBOSE%" == "true" ECHO Downloading Maven Wrapper...
  IF EXIST "%MAVEN_WRAPPER_DOWNLOADER_PATH%" (
    "%JAVA_CMD%" -cp "%MAVEN_WRAPPER_JAR_DIR%" MavenWrapperDownloader "%MAVEN_PROJECT_BASE_DIR%"
    IF ERRORLEVEL 1 (
      ECHO ERROR: Failed to download Maven Wrapper.
      GOTO end
    )
  ) ELSE (
    ECHO ERROR: MavenWrapperDownloader.java not found.
    GOTO end
  )
)

SET "MAVEN_OPTS=%MAVEN_OPTS%"

ECHO Running: "%JAVA_CMD%" %MAVEN_OPTS% -cp "%MAVEN_WRAPPER_JAR_PATH%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECT_BASE_DIR%" org.apache.maven.wrapper.MavenWrapperMain %MAVEN_CMD_LINE_ARGS%

"%JAVA_CMD%" %MAVEN_OPTS% -cp "%MAVEN_WRAPPER_JAR_PATH%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECT_BASE_DIR%" org.apache.maven.wrapper.MavenWrapperMain %MAVEN_CMD_LINE_ARGS%

:end
ENDLOCAL
