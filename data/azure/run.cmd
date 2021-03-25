@ECHO OFF
FOR %%y in (.\graph*.json) DO (
    IF NOT EXIST out\%%~ny MKDIR out\%%~ny
    ECHO Processing %%~ny
    node ../../build/src/apps/convert.js %%~ny.json out\%%~ny\convert.yaml > out\%%~ny\convert.txt
    node ../../build/src/apps/graph.js out\%%~ny\convert.yaml -f Internet -r -b -v > out\%%~ny\graph.txt
)
)

     