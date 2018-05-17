:: Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
:: See LICENSE in the project root for license information.

@if "%SCM_TRACE_LEVEL%" NEQ "4" @echo off





:Deployment
echo Deploy WebJob.


echo %cd%

xcopy /y/s "%~dp0%\src\EDUGraphAPI.SyncData" "%DEPLOYMENT_TARGET%\App_Data\jobs\triggered\SyncData"


::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
goto end

:: Execute command routine that will echo out when error
:ExecuteCmd
setlocal
set _CMD_=%*
call %_CMD_%
if "%ERRORLEVEL%" NEQ "0" echo Failed exitCode=%ERRORLEVEL%, command=%_CMD_%
exit /b %ERRORLEVEL%

:error
endlocal
echo An error has occurred during web site deployment.
call :exitSetErrorLevel
call :exitFromFunction 2>nul

:exitSetErrorLevel
exit /b 1

:exitFromFunction
()

:end
endlocal
echo Finished successfully.
