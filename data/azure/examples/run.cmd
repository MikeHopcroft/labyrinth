@ECHO OFF

SET _EXAMPLES=%~p0
SET _ROOT=%_EXAMPLES%\..\..\..

:READ_FILES
FOR /F %%y in ('DIR /S /B %_ROOT%\*resource-graph.json') DO (
    CALL :ASDIR %%~dpy
)
GOTO :EOF

:ASDIR
    SET _DIR=%1%
    SET _DIR=%_DIR:~0,-1%
    CALL :WITHNAME %_DIR%
GOTO :EOF

:WITHNAME
    CALL :PROCESS %1 %~nx1
GOTO :EOF

:SYM_ROUTE
    SHIFT
    SET FROM_NODE=%~0
    SHIFT
    SET TO_NODE=%~0
    SHIFT
    SET ROUTE_NAME=%0
    SET ROUTE_FLAGS=%1 %2 %3 %4 %5 %6 %7 %8
    CALL :ROUTE "from.%ROUTE_NAME%" -f %FROM_NODE% %ROUTE_FLAGS%
    CALL :ROUTE "to.%ROUTE_NAME%" -t %TO_NODE% %ROUTE_FLAGS%
GOTO :EOF

:ROUTE 
    SHIFT
    SET _ROUTE_NAME=%0
    SET _ROUTE_FLAGS=%1 %2 %3 %4 %5 %6 %7 %8 %9
    node %_ROOT%/build/src/apps/graph.js %YAML% %_ROUTE_FLAGS% > %TXT_GRAPH%.%_ROUTE_NAME%.txt
GOTO :EOF

:DEFAULT_ROUTES
    CALL :SYM_ROUTE Internet Internet internet -r -b -v
    CALL :SYM_ROUTE "vm-001" "vm-001" vm1 -r -b -v
    CALL :SYM_ROUTE "vm-002" "vm-002" vm2 -r -b -v
    CALL :SYM_ROUTE "vm-lb-01" "vm-lb-01" vm3 -r -b -v
GOTO :EOF

:PROCESS
    SET _DIR=%1
    SET _NAME=%2
    SET ROUTES=%_DIR%\_ROUTES
    SET GRAPH=%_DIR%\resource-graph.json
    SET YAML=%_DIR%\convert.yaml
    SET TXT_CONVERT=%_DIR%\convert.txt
    SET TXT_GRAPH=%_DIR%\graph
    ECHO Processing - %_NAME%
    node %_ROOT%/build/src/apps/convert.js %GRAPH% %YAML% > %TXT_CONVERT%

    IF EXIST %ROUTES% (
        FOR /F "tokens=*" %%X IN (%ROUTES%) DO (
            CALL :ROUTE %%X
        )
    ) ELSE (
        CALL :DEFAULT_ROUTES
    )
GOTO  :EOF
