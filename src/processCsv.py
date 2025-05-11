import csv
from datetime import datetime
from dateutil import parser  # For robust date parsing

def convert_date_format(date_str):
    """
    Tries to parse a date string from various known formats and
    returns it in 'yyyy/mm/dd' format. If parsing fails or input is
    empty/invalid, returns the original string.
    """
    if not date_str or date_str.isspace():
        return date_str  # Return empty or whitespace as is

    # Common formats observed in the data
    # (dateutil.parser often handles these, but strptime is more explicit)
    formats_to_try = [
        '%d-%b-%y',       # e.g., 22-Jul-16
        '%d-%b-%Y',       # e.g., 22-Jul-2016
        '%m/%d/%Y',       # e.g., 3/5/1994
        '%m-%d-%Y',       # e.g., 7-Jul-58
        '%Y-%m-%d',       # Standard ISO format
        '%b. %d, %Y',     # e.g., AUG. 10, 1975
        '%d-%m-%Y',       # e.g., 25-03-1969 (as seen in row 138)
        '%m/%d/%y',       # e.g., 03/05/94
    ]

    # Try dateutil.parser first as it's quite robust
    try:
        dt_obj = parser.parse(date_str)
        return dt_obj.strftime('%Y/%m/%d')  # Format to 'YYYY/MM/DD'
    except (ValueError, TypeError, parser.ParserError):
        pass  # If dateutil fails, try explicit formats

    # Try explicit strptime formats
    for fmt in formats_to_try:
        try:
            dt_obj = datetime.strptime(date_str, fmt)
            return dt_obj.strftime('%Y/%m/%d')  # Format to 'YYYY/MM/DD'
        except ValueError:
            continue  # Try next format

    # If all attempts fail, return the original string
    return date_str


input_filename = 'src/pwd.csv'  # Replace with your input file path
output_filename = 'src/pwd_corrected.csv'  # Replace with your desired output path

try:
    with open(input_filename, 'r', newline='', encoding='utf-8') as infile, \
         open(output_filename, 'w', newline='', encoding='utf-8') as outfile:

        reader = csv.reader(infile)
        writer = csv.writer(outfile)

        header = next(reader)
        writer.writerow(header)

        # Find column indices for D.O.I. and D.O.B.
        try:
            doi_col_index = header.index('D.O.I.')
        except ValueError:
            print("Error: 'D.O.I.' column not found in header.")
            doi_col_index = -1

        try:
            dob_col_index = header.index('D.O.B.')
        except ValueError:
            print("Error: 'D.O.B.' column not found in header.")
            dob_col_index = -1
        
        if doi_col_index == -1 and dob_col_index == -1:
            print("Neither D.O.I. nor D.O.B. columns found. Exiting.")
            exit()

        # Process each row
        for row_num, row in enumerate(reader, start=2):  # start=2 because header is row 1
            if not row:  # Skip empty rows
                continue
            
            # Process D.O.I. if column exists
            if doi_col_index != -1 and doi_col_index < len(row):
                original_doi = row[doi_col_index].strip()
                row[doi_col_index] = convert_date_format(original_doi)

            # Process D.O.B. if column exists
            if dob_col_index != -1 and dob_col_index < len(row):
                original_dob = row[dob_col_index].strip()
                # Handle specific non-date string like '6mos.' or '4 M.O' etc.
                if any(x in original_dob.lower() for x in ['mos.', 'm.o', 'months']):
                    row[dob_col_index] = original_dob  # Keep it as is
                else:
                    row[dob_col_index] = convert_date_format(original_dob)

            writer.writerow(row)

    print(f"Processing complete. Output saved to '{output_filename}'")

except FileNotFoundError:
    print(f"Error: Input file '{input_filename}' not found.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
