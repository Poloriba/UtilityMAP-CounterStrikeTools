@ REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.
@REM Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET __ MVNW_CMD__=
@SET __MVNW_ERROR__=
@SET __MVNW_SAVE_ERRORLEVEL__=
@SETLOCAL

@REM ===========================================================================
@REM Validate environment
@REM ===========================================================================
@IF NOT "%JAVA_HOME%"=="" GOTO javaHomeSet
@FOR %%i IN (java.exe) DO @SET JAVACMD="%%~$PATH:i"
@IF "%JAVACMD%"=="" SET __MVNW_ERROR__=Error: JAVA_HOME not set and no 'java' command could be found in your PATH.
@IF NOT "%__MVNW_ERROR__%"=="" GOTO error
@GOTO mvnwExec
:javaHomeSet
@SET JAVACMD="%JAVA_HOME%\bin\java.exe"
@IF NOT EXIST %JAVACMD% SET __MVNW_ERROR__=Error: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
@IF NOT "%__MVNW_ERROR__%"=="" GOTO error

:mvnwExec
@SET MAVEN_PROJECTBASEDIR=%~dp0
@SET MAVEN_WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties
@SET MAVEN_WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar
@IF EXIST "%MAVEN_WRAPPER_JAR%" GOTO runWithWrapperJar

@REM Download wrapper jar if missing
@FOR /F "usebackq tokens=1,2 delims==" %%a IN ("%MAVEN_WRAPPER_PROPERTIES%") DO (
    @IF "%%a"=="wrapperUrl" SET WRAPPER_URL=%%b
)
@PowerShell -Command "&{"^
    "$wc = New-Object System.Net.WebClient;"^
    "if (!([string]::IsNullOrEmpty('%WRAPPER_URL%'))) {"^
    "  $wc.DownloadFile('%WRAPPER_URL%', '%MAVEN_WRAPPER_JAR%');"^
    "}"^
"}"

:runWithWrapperJar
@%JAVACMD% ^
  -classpath "%MAVEN_WRAPPER_JAR%" ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
  org.apache.maven.wrapper.MavenWrapperMain %*
@SET __MVNW_SAVE_ERRORLEVEL__=%ERRORLEVEL%
@IF NOT "%__MVNW_SAVE_ERRORLEVEL__%"=="0" GOTO error
@GOTO end

:error
@IF NOT "%__MVNW_ERROR__%"=="" ECHO %__MVNW_ERROR__%
@EXIT /B %__MVNW_SAVE_ERRORLEVEL__%

:end
@ENDLOCAL
@EXIT /B 0
